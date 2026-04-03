/**
 * Auto-confirmation script
 * Processes bookings where the confirmation deadline has passed (48h after match)
 * and automatically releases payment to goalkeepers
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function processAutoConfirmations() {
  console.log('🔄 Starting auto-confirmation process...');
  
  const now = new Date();
  
  try {
    // Find all bookings that need auto-confirmation
    const bookingsToConfirm = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED', // Match happened but not yet completed
        confirmationDeadline: {
          lte: now, // Deadline has passed
        },
        isCompleted: false,
        noShow: false,
      },
      include: {
        goalkeeper: true,
        goalkeeperProfile: true,
        organizer: true,
      },
    });

    console.log(`📋 Found ${bookingsToConfirm.length} bookings to auto-confirm`);

    for (const booking of bookingsToConfirm) {
      try {
        console.log(`⚙️  Processing booking ${booking.id}...`);

        // Calculate goalkeeper earnings (75% of totalAmount)
        const goalkeeperEarning = Math.floor(booking.totalAmount * 0.75);
        const platformFee = booking.totalAmount - goalkeeperEarning;

        // Process auto-confirmation in transaction
        await prisma.$transaction(async (tx) => {
          // 1. Update booking status
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: 'COMPLETED',
              confirmedAt: now,
              isCompleted: true,
            },
          });

          // 2. Update payment to COMPLETED
          await tx.payment.updateMany({
            where: {
              bookingId: booking.id,
              status: 'PENDING',
            },
            data: {
              status: 'COMPLETED',
              goalkeeperEarning,
              platformFee,
            },
          });

          // 3. Update goalkeeper profile stats
          if (booking.goalkeeperProfile) {
            await tx.goalkeeperProfile.update({
              where: { id: booking.goalkeeperProfile.id },
              data: {
                totalMatches: { increment: 1 },
                totalEarnings: { increment: goalkeeperEarning },
              },
            });
          }

          // 4. Create notification for goalkeeper
          if (booking.goalkeeperId) {
            await tx.notification.create({
              data: {
                userId: booking.goalkeeperId,
                bookingId: booking.id,
                title: '✅ Payment Automatically Released',
                message: `Payment of €${(goalkeeperEarning / 100).toFixed(2)} has been automatically released for your match on ${booking.date.toLocaleDateString()}. The organizer did not respond within 48h.`,
                type: 'PAYMENT_RELEASED',
              },
            });
          }

          // 5. Create notification for organizer
          await tx.notification.create({
            data: {
              userId: booking.organizerId,
              bookingId: booking.id,
              title: '⏰ Confirmation Deadline Passed',
              message: `The 48h confirmation window has passed for your match on ${booking.date.toLocaleDateString()}. Payment was automatically released to the goalkeeper.`,
              type: 'GENERAL',
            },
          });
        });

        console.log(`✅ Auto-confirmed booking ${booking.id} - €${(goalkeeperEarning / 100).toFixed(2)} released`);
      } catch (error) {
        console.error(`❌ Error processing booking ${booking.id}:`, error);
      }
    }

    console.log(`✅ Auto-confirmation process completed. Processed ${bookingsToConfirm.length} bookings.`);
  } catch (error) {
    console.error('❌ Error in auto-confirmation process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
processAutoConfirmations()
  .then(() => {
    console.log('✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
