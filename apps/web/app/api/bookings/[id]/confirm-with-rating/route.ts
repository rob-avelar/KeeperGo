
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ORGANIZER') {
      return NextResponse.json(
        { error: 'Unauthorized - Organizer access required' },
        { status: 401 }
      );
    }

    const { rating, comment } = await request.json();
    const bookingId = params.id;

    // Validate rating fields
    if (!rating || typeof rating !== 'object') {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    const { punctuality, attitude, technicalSkill } = rating;

    if (!punctuality || !attitude || !technicalSkill) {
      return NextResponse.json(
        { error: 'All rating fields are required (punctuality, attitude, technicalSkill)' },
        { status: 400 }
      );
    }

    // Validate rating values
    if (
      punctuality < 1 || punctuality > 5 ||
      attitude < 1 || attitude > 5 ||
      technicalSkill < 1 || technicalSkill > 10
    ) {
      return NextResponse.json(
        { error: 'Invalid rating values' },
        { status: 400 }
      );
    }

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        goalkeeper: true,
        goalkeeperProfile: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is the organizer
    if (booking.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to confirm this booking' },
        { status: 403 }
      );
    }

    // Check if booking has a goalkeeper
    if (!booking.goalkeeperId) {
      return NextResponse.json(
        { error: 'No goalkeeper assigned to this booking' },
        { status: 400 }
      );
    }

    // Check if booking is in correct status
    if (booking.status !== 'AWAITING_CONFIRMATION' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking is not awaiting confirmation' },
        { status: 400 }
      );
    }

    // Check if already confirmed
    if (booking.confirmedAt) {
      return NextResponse.json(
        { error: 'Booking already confirmed' },
        { status: 400 }
      );
    }

    // Check if within confirmation deadline
    const now = new Date();
    if (booking.confirmationDeadline && now > booking.confirmationDeadline) {
      return NextResponse.json(
        { error: 'Confirmation deadline has passed. Payment has been automatically released.' },
        { status: 400 }
      );
    }

    // Calculate overall rating
    const overallRating = (punctuality + attitude + technicalSkill / 2) / 3;

    // Calculate goalkeeper earnings (75% of total amount)
    const goalkeeperEarning = Math.floor(booking.totalAmount * 0.75);
    const platformFee = booking.totalAmount - goalkeeperEarning;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create rating
      const newRating = await tx.rating.create({
        data: {
          bookingId: booking.id,
          raterId: session.user!.id,
          ratedUserId: booking.goalkeeperId!,
          punctuality,
          attitude,
          technicalSkill,
          overallRating,
          comment: comment || null,
        },
      });

      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'COMPLETED',
          confirmedAt: now,
          isCompleted: true,
        },
      });

      // Update or create payment
      let payment;
      if (booking.payments && booking.payments.length > 0) {
        payment = await tx.payment.update({
          where: { id: booking.payments[0].id },
          data: {
            status: 'COMPLETED',
            goalkeeperEarning,
            platformFee,
          },
        });
      } else {
        payment = await tx.payment.create({
          data: {
            userId: booking.goalkeeperId!,
            bookingId: booking.id,
            amount: booking.totalAmount,
            platformFee,
            goalkeeperEarning,
            status: 'COMPLETED',
          },
        });
      }

      // Update goalkeeper profile stats
      if (booking.goalkeeperProfile) {
        const allRatings = await tx.rating.findMany({
          where: { ratedUserId: booking.goalkeeperId! },
        });

        const avgRating =
          allRatings.reduce((sum, r) => sum + r.overallRating, 0) /
          allRatings.length;

        await tx.goalkeeperProfile.update({
          where: { id: booking.goalkeeperProfile.id },
          data: {
            totalMatches: { increment: 1 },
            averageRating: avgRating,
            totalEarnings: { increment: goalkeeperEarning },
          },
        });
      }

      // Notify goalkeeper about payment
      await tx.notification.create({
        data: {
          userId: booking.goalkeeperId!,
          bookingId: booking.id,
          title: 'Payment Released',
          message: `Your payment of €${(goalkeeperEarning / 100).toFixed(2)} has been released!`,
          type: 'PAYMENT_RELEASED',
        },
      });

      return { booking: updatedBooking, rating: newRating, payment };
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      rating: result.rating,
      payment: result.payment,
    });
  } catch (error) {
    console.error('Error confirming booking with rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
