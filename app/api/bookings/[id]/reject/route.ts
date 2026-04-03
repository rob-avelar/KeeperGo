
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Find the booking and verify it belongs to this goalkeeper
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        goalkeeperId: session.user.id,
        status: 'PENDING'
      },
      include: {
        organizer: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or not available' }, { status: 404 })
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'REJECTED' }
    })

    // Create notification for organizer
    await prisma.notification.create({
      data: {
        userId: booking.organizerId,
        bookingId: booking.id,
        title: 'Booking Declined',
        message: `${session.user.name} has declined your booking request for ${new Date(booking.date).toLocaleDateString()}`,
        type: 'BOOKING_REJECTED'
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error rejecting booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
