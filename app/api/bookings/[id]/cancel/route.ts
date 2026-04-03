import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingCancelledEmail } from '@/lib/email';

// Cancellation rules for organizers
function calculateOrganizerRefund(hoursUntilMatch: number, totalAmount: number) {
  if (hoursUntilMatch > 6) {
    return { refundPercent: 100, refund: totalAmount, fee: 0 };
  } else if (hoursUntilMatch > 3) {
    return { refundPercent: 50, refund: Math.floor(totalAmount * 0.5), fee: Math.floor(totalAmount * 0.5) };
  } else if (hoursUntilMatch > 1) {
    return { refundPercent: 25, refund: Math.floor(totalAmount * 0.25), fee: Math.floor(totalAmount * 0.75) };
  } else {
    return { refundPercent: 0, refund: 0, fee: totalAmount };
  }
}

// Warning levels for goalkeeper cancellations
function getGoalkeeperWarning(hoursUntilMatch: number) {
  if (hoursUntilMatch > 24) {
    return { warning: 0, warningLevel: 'NONE', blockDays: 0 };
  } else if (hoursUntilMatch > 6) {
    return { warning: 1, warningLevel: 'LIGHT', blockDays: 0 };
  } else if (hoursUntilMatch > 3) {
    return { warning: 2, warningLevel: 'MODERATE', blockDays: 0 };
  } else if (hoursUntilMatch > 1) {
    return { warning: 3, warningLevel: 'SEVERE', blockDays: 0 };
  } else {
    return { warning: 3, warningLevel: 'CRITICAL', blockDays: 7 }; // Block for 7 days
  }
}

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

    // Check if user is involved in this booking
    const isOrganizer = booking.organizerId === session.user.id;
    const isGoalkeeper = booking.goalkeeperId === session.user.id;

    if (!isOrganizer && !isGoalkeeper) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if already cancelled, completed, or no-show
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This booking has already been cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'COMPLETED' || booking.noShow) {
      return NextResponse.json(
        { error: 'Cannot cancel a completed or no-show booking' },
        { status: 400 }
      );
    }

    // Calculate hours until match
    const now = new Date();
    const matchTime = new Date(booking.date);
    const hoursUntilMatch = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Cannot cancel after match has started
    if (hoursUntilMatch < 0) {
      return NextResponse.json(
        { error: 'Cannot cancel a match that has already started or passed' },
        { status: 400 }
      );
    }

    let refundAmount = 0;
    let cancellationFee = 0;
    let warningData = null;

    // Handle ORGANIZER cancellation
    if (isOrganizer) {
      const refundCalc = calculateOrganizerRefund(hoursUntilMatch, booking.totalAmount);
      refundAmount = refundCalc.refund;
      cancellationFee = refundCalc.fee;

      const result = await prisma.$transaction(async (tx) => {
        // Update booking
        const updatedBooking = await tx.booking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
            cancelledBy: session.user.id,
            cancellationReason: reason || 'Organizer cancelled',
            cancellationFee,
            refundAmount,
          },
        });

        // Update payment
        await tx.payment.updateMany({
          where: {
            bookingId: id,
            status: 'PENDING',
          },
          data: {
            status: cancellationFee > 0 ? 'COMPLETED' : 'REFUNDED',
            platformFee: cancellationFee,
            goalkeeperEarning: 0,
          },
        });

        // Notify goalkeeper if assigned
        if (booking.goalkeeperId) {
          await tx.notification.create({
            data: {
              userId: booking.goalkeeperId,
              bookingId: id,
              title: 'Match Cancelled by Organizer',
              message: `The match on ${matchTime.toLocaleDateString()} has been cancelled by the organizer. ${hoursUntilMatch > 6 ? 'This was a free cancellation.' : `Cancellation was ${hoursUntilMatch.toFixed(1)}h before the match.`}`,
              type: 'BOOKING_CANCELLED',
            },
          });
        }

        return { updatedBooking };
      });

      // Send cancellation email to goalkeeper
      if (booking.goalkeeper?.email && booking.goalkeeper.emailNotifications) {
        sendBookingCancelledEmail(
          booking.goalkeeper.email,
          booking.goalkeeper.name || 'Goalkeeper',
          'GOALKEEPER',
          matchTime,
          booking.location,
          reason
        ).catch(err => console.error('[Cancel] Email send error:', err))
      }

      return NextResponse.json({
        success: true,
        message: `Booking cancelled. Refund: €${(refundAmount / 100).toFixed(2)} (${refundCalc.refundPercent}%)`,
        booking: result.updatedBooking,
        refundAmount,
        cancellationFee,
      });
    }

    // Handle GOALKEEPER cancellation
    // Booking goes back to PENDING (available for other goalkeepers)
    // If < 6h before match, it becomes a PRIORITY booking
    if (isGoalkeeper) {
      if (!booking.goalkeeperProfile) {
        return NextResponse.json(
          { error: 'Goalkeeper profile not found' },
          { status: 400 }
        );
      }

      const warningCalc = getGoalkeeperWarning(hoursUntilMatch);
      warningData = warningCalc;

      const isPriority = hoursUntilMatch <= 6;
      const priorityReason = isPriority
        ? `Goalkeeper cancelled ${hoursUntilMatch.toFixed(1)}h before match`
        : null;

      const result = await prisma.$transaction(async (tx) => {
        // Reset booking to PENDING — remove goalkeeper, make available again
        const updatedBooking = await tx.booking.update({
          where: { id },
          data: {
            status: 'PENDING',
            goalkeeperId: null,
            goalkeeperProfileId: null,
            confirmationDeadline: null,
            goalkeeperConfirmedAt: null,
            isPriority,
            priorityReason,
            // Clear previous cancellation data
            cancelledAt: null,
            cancelledBy: null,
            cancellationReason: null,
            cancellationFee: null,
            refundAmount: null,
          },
        });

        // Refund any existing payments
        await tx.payment.updateMany({
          where: {
            bookingId: id,
            status: { in: ['PENDING', 'COMPLETED'] },
          },
          data: {
            status: 'REFUNDED',
            platformFee: 0,
            goalkeeperEarning: 0,
          },
        });

        // Apply warning/block to goalkeeper
        let blockUntil = null;
        if (warningCalc.blockDays > 0) {
          blockUntil = new Date();
          blockUntil.setDate(blockUntil.getDate() + warningCalc.blockDays);
        }

        const updatedProfile = await tx.goalkeeperProfile.update({
          where: { id: booking.goalkeeperProfile!.id },
          data: {
            warningCount: { increment: warningCalc.warning },
            ...(blockUntil && { 
              blockedUntil: blockUntil,
              isActive: false 
            }),
          },
        });

        // Check if should be permanently blocked (3+ severe warnings)
        if (updatedProfile.warningCount >= 9) {
          await tx.goalkeeperProfile.update({
            where: { id: booking.goalkeeperProfile!.id },
            data: {
              isActive: false,
              blockedUntil: new Date('2099-12-31'),
            },
          });
        }

        // Notify organizer — match is back available
        await tx.notification.create({
          data: {
            userId: booking.organizerId,
            bookingId: id,
            title: isPriority ? '🚨 Goalkeeper Left — Priority Match!' : 'Goalkeeper Left — Match Re-opened',
            message: isPriority
              ? `The goalkeeper cancelled your match on ${matchTime.toLocaleDateString()} (${hoursUntilMatch.toFixed(0)}h before kickoff). Your match is now listed as PRIORITY and visible to all available goalkeepers. Any previous payment will be refunded.`
              : `The goalkeeper cancelled your match on ${matchTime.toLocaleDateString()}. Your match is now back in the available listings for other goalkeepers to accept. Any previous payment will be refunded.`,
            type: 'BOOKING_CANCELLED',
          },
        });

        // Notify goalkeeper about warning (if any)
        if (warningCalc.warning > 0) {
          let warningMessage = `You cancelled ${hoursUntilMatch.toFixed(1)}h before the match. Warning level: ${warningCalc.warningLevel}.`;
          if (warningCalc.blockDays > 0) {
            warningMessage += ` Your account has been temporarily blocked for ${warningCalc.blockDays} days.`;
          }
          warningMessage += ` Total warnings: ${updatedProfile.warningCount}. (9 warnings = permanent block)`;

          await tx.notification.create({
            data: {
              userId: session.user.id,
              bookingId: id,
              title: '⚠️ Cancellation Warning',
              message: warningMessage,
              type: 'WARNING_ISSUED',
            },
          });
        }

        return { updatedBooking, updatedProfile };
      });

      // Send email to organizer
      if (booking.organizer?.email && booking.organizer.emailNotifications) {
        sendBookingCancelledEmail(
          booking.organizer.email,
          booking.organizer.name || 'Organizer',
          'ORGANIZER',
          matchTime,
          booking.location,
          reason || (isPriority ? 'Goalkeeper left — your match is now priority!' : 'Goalkeeper left — match re-opened for new goalkeepers')
        ).catch(err => console.error('[Cancel] Email send error:', err))
      }

      return NextResponse.json({
        success: true,
        message: isPriority
          ? `Match re-opened as PRIORITY. Organizer will be refunded. Warning: ${warningData.warningLevel}`
          : `Match re-opened for other goalkeepers.${warningData.warning > 0 ? ` Warning: ${warningData.warningLevel}` : ''}`,
        booking: result.updatedBooking,
        warning: warningData,
        isPriority,
      });
    }

    return NextResponse.json(
      { error: 'Unauthorized action' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
