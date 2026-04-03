export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent } from '@/lib/stripe'
import { sendPaymentReceivedEmail } from '@/lib/email'

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

    // Fetch booking with payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        goalkeeper: {
          select: { id: true, name: true, email: true, emailNotifications: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Already confirmed
    if (booking.status === 'CONFIRMED') {
      return NextResponse.json({ success: true, message: 'Booking already confirmed' })
    }

    const payment = booking.payments[0]
    if (!payment?.stripePaymentId) {
      return NextResponse.json({ error: 'No payment found for this booking' }, { status: 400 })
    }

    // Verify payment with Stripe
    const paymentIntent = await retrievePaymentIntent(payment.stripePaymentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 400 }
      )
    }

    // Update booking and payment in a transaction
    await prisma.$transaction(async (tx) => {
      // Update booking to CONFIRMED
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      })

      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' }
      })

      // Notify goalkeeper that payment is received and match is confirmed
      if (booking.goalkeeperId) {
        await tx.notification.create({
          data: {
            userId: booking.goalkeeperId,
            bookingId: bookingId,
            title: 'Payment Received - Match Confirmed!',
            message: `The organizer has paid €${(booking.totalAmount / 100).toFixed(2)} for the match on ${new Date(booking.date).toLocaleDateString()}. The match is now confirmed!`,
            type: 'PAYMENT_RECEIVED'
          }
        })
      }

      // Notify organizer
      await tx.notification.create({
        data: {
          userId: session.user.id,
          bookingId: bookingId,
          title: 'Payment Successful',
          message: `Your payment of €${(booking.totalAmount / 100).toFixed(2)} was successful. The match is confirmed!`,
          type: 'BOOKING_CONFIRMED'
        }
      })
    })

    // Send payment received email to goalkeeper
    if (booking.goalkeeper?.email && booking.goalkeeper.emailNotifications) {
      sendPaymentReceivedEmail(
        booking.goalkeeper.email,
        booking.goalkeeper.name || 'Goalkeeper',
        booking.totalAmount,
        booking.date,
        booking.location
      ).catch(err => console.error('[ConfirmPayment] Email send error:', err))
    }

    return NextResponse.json({ success: true, message: 'Payment confirmed and booking updated' })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
