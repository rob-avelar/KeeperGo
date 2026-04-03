
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// This endpoint processes bookings that have passed the 48h confirmation deadline
// and automatically releases payment to goalkeepers
export async function GET() {
  try {
    const now = new Date();

    // Find all bookings that:
    // 1. Are in CONFIRMED status
    // 2. Have not been confirmed yet (!confirmedAt)
    // 3. Have not been marked as no-show (!noShow)
    // 4. Have passed the confirmation deadline
    const bookingsToAutoConfirm = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        confirmedAt: null,
        noShow: false,
        confirmationDeadline: {
          lte: now, // Deadline has passed
        },
      },
      include: {
        organizer: true,
        goalkeeper: true,
        goalkeeperProfile: true,
        payments: true,
      },
    });

    console.log(`[Auto-Confirm] Found ${bookingsToAutoConfirm.length} bookings to auto-confirm`);

    const results = {
      processed: 0,
      errors: 0,
      skipped: 0,
    };

    // Process each booking
    for (const booking of bookingsToAutoConfirm) {
      try {
        // Skip if goalkeeper info is missing
        if (!booking.goalkeeperId || !booking.goalkeeperProfile) {
          console.log(`[Auto-Confirm] Skipping booking ${booking.id} - missing goalkeeper info`);
          results.skipped++;
          continue;
        }

        // Calculate goalkeeper earnings (75% of total amount)
        const goalkeeperEarning = Math.floor(booking.totalAmount * 0.75);
        const platformFee = booking.totalAmount - goalkeeperEarning;

        // Use transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
          // Update booking status
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: 'COMPLETED',
              confirmedAt: now,
              isCompleted: true,
            },
          });

          // Update or create payment
          if (booking.payments && booking.payments.length > 0) {
            await tx.payment.update({
              where: { id: booking.payments[0].id },
              data: {
                status: 'COMPLETED',
                goalkeeperEarning,
                platformFee,
              },
            });
          } else {
            await tx.payment.create({
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

            let avgRating = 0;
            if (allRatings.length > 0) {
              avgRating =
                allRatings.reduce((sum, r) => sum + r.overallRating, 0) /
                allRatings.length;
            }

            await tx.goalkeeperProfile.update({
              where: { id: booking.goalkeeperProfile.id },
              data: {
                totalMatches: { increment: 1 },
                averageRating: avgRating,
                totalEarnings: { increment: goalkeeperEarning },
              },
            });
          }

          // Notify goalkeeper about automatic payment
          await tx.notification.create({
            data: {
              userId: booking.goalkeeperId!,
              bookingId: booking.id,
              title: 'Payment Automatically Released',
              message: `Your payment of €${(goalkeeperEarning / 100).toFixed(2)} has been automatically released (48h confirmation deadline passed).`,
              type: 'PAYMENT_RELEASED',
            },
          });

          // Notify organizer that deadline passed
          await tx.notification.create({
            data: {
              userId: booking.organizerId,
              bookingId: booking.id,
              title: 'Confirmation Deadline Passed',
              message: `The 48h confirmation window for your match on ${new Date(booking.date).toLocaleDateString()} has closed. Payment has been released to the goalkeeper.`,
              type: 'GENERAL',
            },
          });
        });

        console.log(`[Auto-Confirm] Successfully auto-confirmed booking ${booking.id}`);
        results.processed++;
      } catch (error) {
        console.error(`[Auto-Confirm] Error processing booking ${booking.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-confirmation completed: ${results.processed} processed, ${results.errors} errors, ${results.skipped} skipped`,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[Auto-Confirm] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
