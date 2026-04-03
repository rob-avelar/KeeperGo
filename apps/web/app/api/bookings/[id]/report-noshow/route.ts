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
    const { reason } = body;

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
        { error: 'Only the organizer can report no-show' },
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
        { error: 'Cannot report no-show before the match time' },
        { status: 400 }
      );
    }

    // Check confirmation deadline (48h after match)
    if (booking.confirmationDeadline && now > booking.confirmationDeadline) {
      return NextResponse.json(
        { error: 'Reporting deadline has passed (48h after match). Payment was automatically released.' },
        { status: 400 }
      );
    }

    // Check if already confirmed or reported
    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'This booking has already been confirmed as completed' },
        { status: 400 }
      );
    }

    if (booking.noShow) {
      return NextResponse.json(
        { error: 'No-show has already been reported for this booking' },
        { status: 400 }
      );
    }

    // Create transaction to handle no-show
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update booking as no-show
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'NO_SHOW',
          noShow: true,
          confirmedAt: now,
        },
      });

      // 2. Refund organizer - update payment to REFUNDED
      await tx.payment.updateMany({
        where: {
          bookingId: id,
          status: 'PENDING',
        },
        data: {
          status: 'REFUNDED',
          goalkeeperEarning: 0,
          platformFee: 0,
        },
      });

      // 3. Block goalkeeper permanently (or for a very long time)
      const blockUntil = new Date();
      blockUntil.setFullYear(blockUntil.getFullYear() + 10); // Block for 10 years (effectively permanent)

      await tx.goalkeeperProfile.update({
        where: { id: booking.goalkeeperProfile!.id },
        data: {
          isActive: false,
          blockedUntil: blockUntil,
          warningCount: { increment: 100 }, // Severe penalty
        },
      });

      // 4. Create notification for goalkeeper
      await tx.notification.create({
        data: {
          userId: booking.goalkeeperId!,
          bookingId: id,
          title: '🚫 Account Blocked - No-Show',
          message: `Your account has been blocked due to a no-show report. The organizer reported that you did not attend the match on ${booking.date.toLocaleDateString()}. Reason: ${reason || 'No reason provided'}`,
          type: 'BLOCKED',
        },
      });

      // 5. Create notification for organizer
      await tx.notification.create({
        data: {
          userId: booking.organizerId,
          bookingId: id,
          title: 'No-Show Report Processed',
          message: `Your no-show report has been processed. Full refund of €${(booking.totalAmount / 100).toFixed(2)} will be issued. The goalkeeper has been blocked.`,
          type: 'PAYMENT_RECEIVED',
        },
      });

      return { updatedBooking };
    });

    return NextResponse.json({
      success: true,
      message: 'No-show reported. Goalkeeper blocked and full refund issued.',
      booking: result.updatedBooking,
    });
  } catch (error) {
    console.error('Error reporting no-show:', error);
    return NextResponse.json(
      { error: 'Failed to report no-show' },
      { status: 500 }
    );
  }
}
