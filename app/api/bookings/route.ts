
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = session.user.id

    let whereClause: any = {}

    if (session.user.role === 'ORGANIZER') {
      whereClause.organizerId = userId
    } else if (session.user.role === 'GOALKEEPER') {
      whereClause.goalkeeperId = userId
    }

    if (status) {
      whereClause.status = status
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goalkeeper: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goalkeeperProfile: {
          select: {
            id: true,
            averageRating: true,
            totalMatches: true
          }
        },
        ratings: true,
        payments: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      date,
      duration,
      location,
      latitude,
      longitude,
      fieldType,
      pricePerHour,
      specialRequests,
      bookingType,
      goalkeeperId
    } = body

    if (!date || !duration || !location || !fieldType || !pricePerHour) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate direct booking
    if (bookingType === 'direct' && !goalkeeperId) {
      return NextResponse.json({ error: 'Goalkeeper ID required for direct booking' }, { status: 400 })
    }

    // Calculate total amount with premium for direct booking
    const isPremium = bookingType === 'direct'
    const premiumMultiplier = isPremium ? 1.25 : 1
    const baseAmount = pricePerHour * duration
    const totalAmount = Math.round(baseAmount * premiumMultiplier)

    // Get goalkeeper profile if direct booking
    let goalkeeperProfileId = null
    if (bookingType === 'direct' && goalkeeperId) {
      const goalkeeperProfile = await prisma.goalkeeperProfile.findUnique({
        where: { userId: goalkeeperId }
      })
      goalkeeperProfileId = goalkeeperProfile?.id || null

      // Check if goalkeeper exists
      const goalkeeper = await prisma.user.findUnique({
        where: { id: goalkeeperId }
      })
      if (!goalkeeper || goalkeeper.role !== 'GOALKEEPER') {
        return NextResponse.json({ error: 'Invalid goalkeeper' }, { status: 400 })
      }
    }

    // Calculate confirmation deadline for direct bookings (48h after match end time)
    let confirmationDeadline = null;
    if (bookingType === 'direct') {
      const matchDate = new Date(date);
      const matchEndTime = new Date(matchDate);
      matchEndTime.setHours(matchEndTime.getHours() + parseInt(duration));
      confirmationDeadline = new Date(matchEndTime);
      confirmationDeadline.setHours(confirmationDeadline.getHours() + 48);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        organizerId: session.user.id,
        goalkeeperId: bookingType === 'direct' ? goalkeeperId : null,
        goalkeeperProfileId,
        date: new Date(date),
        duration: parseInt(duration),
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        fieldType,
        pricePerHour: parseInt(pricePerHour),
        totalAmount,
        specialRequests,
        status: bookingType === 'direct' ? 'ACCEPTED' : 'PENDING', // Direct bookings go to ACCEPTED (awaiting payment)
        confirmationDeadline,
      }
    })

    // Create notification for direct booking
    if (bookingType === 'direct' && goalkeeperId) {
      await prisma.notification.create({
        data: {
          userId: goalkeeperId,
          type: 'BOOKING_ACCEPTED',
          title: 'Direct Booking - Awaiting Payment',
          message: `You have been directly booked for a match on ${new Date(date).toLocaleDateString()}. Awaiting organizer payment.`,
          bookingId: booking.id
        }
      })
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
