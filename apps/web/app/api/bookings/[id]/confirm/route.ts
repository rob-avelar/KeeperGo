import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { punctuality, attitude, technicalSkill, comment } = body;

    // Validate rating fields
    if (!punctuality || !attitude || !technicalSkill) {
      return NextResponse.json(
        { error: 'All rating fields (punctuality, attitude, technicalSkill) are required' },
        { status: 400 }
      );
    }

    if (
      punctuality < 1 || punctuality > 5 ||
      attitude < 1 || attitude > 5 ||
      technicalSkill < 1 || technicalSkill > 10
    ) {
      return NextResponse.json(
        { error: 'Invalid rating values. Punctuality and attitude: 1-5, Technical skill: 1-10' },
        { status: 400 }
      );
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        goalkeeper: true,
        goalkeeperProfile: true,
        organizer: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify organizer
    if (booking.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the organizer can confirm presence' },
        { status: 403 }
      );
    }

    // Check if booking has a goalkeeper
    if (!booking.goalkeeperId || !booking.goalkeeperProfile) {
      return NextResponse.json(
        { error: 'This booking does not have an assigned goalkeeper' },
        { status: 400 }
      );
    }

    // Check if match has happened
    const now = new Date();
    const matchEndTime = new Date(booking.date.getTime() + booking.duration * 60 * 60 * 1000);
    if (matchEndTime > now) {
      return NextResponse.json(
        { error: 'Cannot confirm before the match has ended' },
        { status: 400 }
      );
    }

    // Check confirmation deadline (48h after match)
    if (booking.confirmationDeadline && now > booking.confirmationDeadline) {
      return NextResponse.json(
        { error: 'Confirmation deadline has passed (48h after match)' },
        { status: 400 }
      );
    }

    // Check if already confirmed or reported
    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'This booking has already been confirmed' },
        { status: 400 }
      );
    }

    if (booking.noShow) {
      return NextResponse.json(
        { error: 'This booking was already reported as no-show' },
        { status: 400 }
      );
    }

    // Calculate overall rating
    const overallRating = (punctuality + attitude + technicalSkill / 2) / 3;

    // Calculate goalkeeper earnings (75% of totalAmount)
    const goalkeeperEarning = Math.floor(booking.totalAmount * 0.75);
    const platformFee = booking.totalAmount - goalkeeperEarning;

    // Create transaction to update everything
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create rating
      const rating = await tx.rating.create({
        data: {
          bookingId: booking.id,
          raterId: session.user.id,
          ratedUserId: booking.goalkeeperId!,
          punctuality,
          attitude,
          technicalSkill,
          overallRating,
          comment: comment || '',
        },
      });

      // 2. Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          confirmedAt: now,
          isCompleted: true,
        },
      });

      // 3. Update payment to COMPLETED
      await tx.payment.updateMany({
        where: {
          bookingId: id,
          status: 'PENDING',
        },
        data: {
          status: 'COMPLETED',
          goalkeeperEarning,
          platformFee,
        },
      });

      // 4. Update goalkeeper profile stats
      const allRatings = await tx.rating.findMany({
        where: { ratedUserId: booking.goalkeeperId! },
      });

      const totalRating = allRatings.reduce((sum, r) => sum + r.overallRating, 0);
      const averageRating = allRatings.length > 0 ? totalRating / allRatings.length : 0;

      await tx.goalkeeperProfile.update({
        where: { id: booking.goalkeeperProfile!.id },
        data: {
          totalMatches: { increment: 1 },
          totalEarnings: { increment: goalkeeperEarning },
          averageRating,
        },
      });

      // 5. Create notification for goalkeeper
      await tx.notification.create({
        data: {
          userId: booking.goalkeeperId!,
          bookingId: id,
          title: 'Match Confirmed & Payment Released',
          message: `The organizer confirmed your presence! You earned €${(goalkeeperEarning / 100).toFixed(2)}. Rating: ${overallRating.toFixed(1)}/5`,
          type: 'PAYMENT_RELEASED',
        },
      });

      return { updatedBooking, rating, goalkeeperEarning };
    });

    return NextResponse.json({
      success: true,
      message: 'Presence confirmed and payment released to goalkeeper',
      booking: result.updatedBooking,
      rating: result.rating,
      goalkeeperEarning: result.goalkeeperEarning,
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
