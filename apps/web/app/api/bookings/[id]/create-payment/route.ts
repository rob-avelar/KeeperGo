export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntentForBooking } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Fetch booking with goalkeeper's Stripe info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        goalkeeperProfile: {
          select: {
            stripeAccountId: true,
            stripeChargesEnabled: true,
          }
        },
        goalkeeper: {
          select: { id: true, name: true }
        },
        payments: {
          where: { status: { in: ['PENDING', 'PROCESSING'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only the organizer can pay
    if (booking.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the organizer can pay for this booking' }, { status: 403 })
    }

    // Booking must be ACCEPTED (goalkeeper accepted, awaiting payment)
    if (booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: `Cannot pay for a booking with status: ${booking.status}` },
        { status: 400 }
      )
    }

    // Check if there's already a pending payment with a valid client secret
    const existingPayment = booking.payments[0]
    if (existingPayment?.stripeClientSecret && existingPayment?.stripePaymentId) {
      return NextResponse.json({
        clientSecret: existingPayment.stripeClientSecret,
        paymentId: existingPayment.id,
        amount: booking.totalAmount,
      })
    }

    // Get goalkeeper's Stripe account (for destination charge)
    const goalkeeperStripeAccountId = booking.goalkeeperProfile?.stripeAccountId || null

    // Create PaymentIntent
    const paymentIntent = await createPaymentIntentForBooking(
      booking.totalAmount,
      bookingId,
      goalkeeperStripeAccountId
    )

    // Calculate fee split
    const goalkeeperEarning = Math.floor(booking.totalAmount * 0.75)
    const platformFee = booking.totalAmount - goalkeeperEarning

    // Create Payment record in DB
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        bookingId: bookingId,
        stripePaymentId: paymentIntent.id,
        amount: booking.totalAmount,
        platformFee,
        goalkeeperEarning,
        status: 'PENDING',
        stripeClientSecret: paymentIntent.client_secret,
        paymentMethod: goalkeeperStripeAccountId ? 'stripe_destination' : 'stripe_platform',
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: booking.totalAmount,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
