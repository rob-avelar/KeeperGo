
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'GOALKEEPER') {
      return NextResponse.json(
        { error: 'Only goalkeepers can confirm their attendance' },
        { status: 403 }
      )
    }

    const bookingId = params.id

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        organizer: true,
        goalkeeper: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is the goalkeeper for this booking
    if (booking.goalkeeperId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not the goalkeeper for this booking' },
        { status: 403 }
      )
    }

    // Check if booking is confirmed (not cancelled, rejected, etc.)
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking is not in a confirmed state' },
        { status: 400 }
      )
    }

    // Check if match has ended
    const matchDate = new Date(booking.date)
    const matchEndTime = new Date(matchDate)
    matchEndTime.setHours(matchEndTime.getHours() + booking.duration)
    const now = new Date()

    if (matchEndTime > now) {
      return NextResponse.json(
        { error: 'Match has not ended yet. You can only confirm attendance after the match.' },
        { status: 400 }
      )
    }

    // Check if already confirmed by goalkeeper
    if (booking.goalkeeperConfirmedAt) {
      return NextResponse.json(
        { error: 'You have already confirmed your attendance' },
        { status: 400 }
      )
    }

    // Check if organizer already confirmed (or marked as no-show)
    if (booking.confirmedAt || booking.noShow) {
      return NextResponse.json(
        { 
          error: booking.noShow 
            ? 'This booking was marked as a no-show by the organizer' 
            : 'The organizer has already confirmed this booking'
        },
        { status: 400 }
      )
    }

    // Update booking with goalkeeper confirmation
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        goalkeeperConfirmedAt: now,
      },
    })

    // Create notification for organizer
    await prisma.notification.create({
      data: {
        userId: booking.organizerId,
        bookingId: booking.id,
        type: 'GENERAL',
        title: 'Goalkeeper Confirmed Attendance',
        message: `${booking.goalkeeper?.name} has confirmed their attendance for the match on ${matchDate.toLocaleDateString()}. Please confirm and rate the goalkeeper to release payment.`,
      },
    })

    return NextResponse.json({
      message: 'Your attendance has been confirmed! The organizer will now validate and rate your performance.',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Error confirming goalkeeper attendance:', error)
    return NextResponse.json(
      { error: 'Failed to confirm attendance' },
      { status: 500 }
    )
  }
}
