export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { constructWebhookEvent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: any

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = constructWebhookEvent(body, signature, webhookSecret)
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else {
      // In development or if no secret configured, parse directly
      event = JSON.parse(body)
      console.warn('⚠️ Webhook signature not verified (no STRIPE_WEBHOOK_SECRET configured)')
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata?.bookingId

        if (!bookingId) {
          console.log('PaymentIntent without bookingId metadata, skipping')
          break
        }

        console.log(`Payment succeeded for booking ${bookingId}, PaymentIntent ${paymentIntent.id}`)

        // Update payment and booking status
        await prisma.$transaction(async (tx) => {
          // Find and update payment
          const payment = await tx.payment.findFirst({
            where: { stripePaymentId: paymentIntent.id }
          })

          if (payment && payment.status !== 'COMPLETED') {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status: 'COMPLETED' }
            })
          }

          // Update booking to CONFIRMED if still ACCEPTED
          const booking = await tx.booking.findUnique({
            where: { id: bookingId }
          })

          if (booking && booking.status === 'ACCEPTED') {
            await tx.booking.update({
              where: { id: bookingId },
              data: { status: 'CONFIRMED' }
            })

            // Notify goalkeeper
            if (booking.goalkeeperId) {
              await tx.notification.create({
                data: {
                  userId: booking.goalkeeperId,
                  bookingId: bookingId,
                  title: 'Payment Received - Match Confirmed!',
                  message: `Payment received! The match on ${new Date(booking.date).toLocaleDateString()} is now confirmed.`,
                  type: 'PAYMENT_RECEIVED'
                }
              })
            }
          }
        })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          console.log(`Payment failed for booking ${bookingId}`)

          await prisma.payment.updateMany({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: 'FAILED' }
          })
        }
        break
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
