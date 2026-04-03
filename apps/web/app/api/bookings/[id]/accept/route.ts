

export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingAcceptedEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'GOALKEEPER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id

    // Get goalkeeper profile
    const goalkeeperProfile = await prisma.goalkeeperProfile.findFirst({
      where: { userId: session.user.id }
    })

    if (!goalkeeperProfile) {
      return NextResponse.json(
        { error: 'Goalkeeper profile not found. Please complete your profile first.' },
        { status: 404 }
      )
    }

    // Use a transaction to ensure atomicity and handle race conditions
    const result = await prisma.$transaction(async (tx) => {
      // First, check if booking is still available
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND')
      }

      // Check if already taken
      if (booking.goalkeeperId !== null) {
        throw new Error('BOOKING_ALREADY_TAKEN')
      }

      // Check if booking is still pending
      if (booking.status !== 'PENDING') {
        throw new Error('BOOKING_NOT_AVAILABLE')
      }

      // Check if booking is in the future
      if (new Date(booking.date) < new Date()) {
        throw new Error('BOOKING_EXPIRED')
      }

      // Calculate confirmation deadline (48h after match end time)
      const matchEndTime = new Date(booking.date);
      matchEndTime.setHours(matchEndTime.getHours() + booking.duration);
      const confirmationDeadline = new Date(matchEndTime);
      confirmationDeadline.setHours(confirmationDeadline.getHours() + 48);

      // Update booking with goalkeeper assignment (ACCEPTED = awaiting payment)
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          goalkeeperId: session.user.id,
          goalkeeperProfileId: goalkeeperProfile.id,
          status: 'ACCEPTED',
          confirmationDeadline,
          isPriority: false,
          priorityReason: null,
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              emailNotifications: true,
              notifyBookingAccepted: true
            }
          }
        }
      })

      // Create notification for organizer
      await tx.notification.create({
        data: {
          userId: booking.organizer.id,
          bookingId: booking.id,
          title: 'Goalkeeper Accepted Your Match!',
          message: `${session.user.name} has accepted your match on ${new Date(booking.date).toLocaleDateString()}`,
          type: 'BOOKING_ACCEPTED'
        }
      })

      // Create notification for goalkeeper
      await tx.notification.create({
        data: {
          userId: session.user.id,
          bookingId: booking.id,
          title: 'Match Accepted',
          message: `You've successfully accepted the match with ${booking.organizer.name} on ${new Date(booking.date).toLocaleDateString()}`,
          type: 'BOOKING_ACCEPTED'
        }
      })

      return updatedBooking
    })

    // Send email notification to organizer
    const organizer = result.organizer
    if (organizer.emailNotifications && organizer.notifyBookingAccepted) {
      await sendBookingAcceptedEmail(
        organizer.email,
        organizer.name || 'there',
        session.user.name || 'A goalkeeper',
        result.date,
        result.location
      ).catch(err => console.error('[Accept] Email send error:', err))
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error accepting booking:', error)
    
    // Handle specific error cases
    if (error.message === 'BOOKING_NOT_FOUND') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    if (error.message === 'BOOKING_ALREADY_TAKEN') {
      return NextResponse.json(
        { error: 'This booking has already been accepted by another goalkeeper' },
        { status: 409 }
      )
    }
    
    if (error.message === 'BOOKING_NOT_AVAILABLE') {
      return NextResponse.json(
        { error: 'This booking is no longer available' },
        { status: 409 }
      )
    }
    
    if (error.message === 'BOOKING_EXPIRED') {
      return NextResponse.json(
        { error: 'This booking date has already passed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
