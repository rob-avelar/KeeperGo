
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMatchReminderEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    
    // Calculate time windows for reminders
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    // Add 30-minute buffer on each side
    const window24HoursStart = new Date(in24Hours.getTime() - 30 * 60 * 1000)
    const window24HoursEnd = new Date(in24Hours.getTime() + 30 * 60 * 1000)
    
    const window2HoursStart = new Date(in2Hours.getTime() - 30 * 60 * 1000)
    const window2HoursEnd = new Date(in2Hours.getTime() + 30 * 60 * 1000)

    // Find bookings that need 24-hour reminders
    const bookingsFor24HourReminder = await prisma.booking.findMany({
      where: {
        date: {
          gte: window24HoursStart,
          lte: window24HoursEnd
        },
        status: { in: ['CONFIRMED', 'ACCEPTED'] },
        NOT: {
          notifications: {
            some: {
              type: 'CONFIRMATION_REMINDER',
              createdAt: {
                gte: new Date(now.getTime() - 25 * 60 * 60 * 1000) // Don't send if sent in last 25 hours
              }
            }
          }
        }
      },
      include: {
        organizer: true,
        goalkeeper: true
      }
    })

    // Find bookings that need 2-hour reminders
    const bookingsFor2HourReminder = await prisma.booking.findMany({
      where: {
        date: {
          gte: window2HoursStart,
          lte: window2HoursEnd
        },
        status: { in: ['CONFIRMED', 'ACCEPTED'] },
        NOT: {
          notifications: {
            some: {
              type: 'CONFIRMATION_REMINDER',
              createdAt: {
                gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) // Don't send if sent in last 3 hours
              }
            }
          }
        }
      },
      include: {
        organizer: true,
        goalkeeper: true
      }
    })

    let sentCount = 0

    // Send 24-hour reminders
    for (const booking of bookingsFor24HourReminder) {
      // Send to organizer
      if (booking.organizer.emailNotifications && booking.organizer.notifyMatchReminder24h) {
        await sendMatchReminderEmail(
          booking.organizer.email,
          booking.organizer.name || 'there',
          'ORGANIZER',
          booking.date,
          booking.location,
          24
        )
        sentCount++
      }

      // Send to goalkeeper
      if (booking.goalkeeper && booking.goalkeeper.emailNotifications && booking.goalkeeper.notifyMatchReminder24h) {
        await sendMatchReminderEmail(
          booking.goalkeeper.email,
          booking.goalkeeper.name || 'there',
          'GOALKEEPER',
          booking.date,
          booking.location,
          24
        )
        sentCount++
      }

      // Create notification records
      await prisma.notification.create({
        data: {
          userId: booking.organizerId,
          bookingId: booking.id,
          title: '24h Match Reminder',
          message: `Your match is in 24 hours at ${booking.location}`,
          type: 'CONFIRMATION_REMINDER'
        }
      })

      if (booking.goalkeeperId) {
        await prisma.notification.create({
          data: {
            userId: booking.goalkeeperId,
            bookingId: booking.id,
            title: '24h Match Reminder',
            message: `Your match is in 24 hours at ${booking.location}`,
            type: 'CONFIRMATION_REMINDER'
          }
        })
      }
    }

    // Send 2-hour reminders
    for (const booking of bookingsFor2HourReminder) {
      // Send to organizer
      if (booking.organizer.emailNotifications && booking.organizer.notifyMatchReminder2h) {
        await sendMatchReminderEmail(
          booking.organizer.email,
          booking.organizer.name || 'there',
          'ORGANIZER',
          booking.date,
          booking.location,
          2
        )
        sentCount++
      }

      // Send to goalkeeper
      if (booking.goalkeeper && booking.goalkeeper.emailNotifications && booking.goalkeeper.notifyMatchReminder2h) {
        await sendMatchReminderEmail(
          booking.goalkeeper.email,
          booking.goalkeeper.name || 'there',
          'GOALKEEPER',
          booking.date,
          booking.location,
          2
        )
        sentCount++
      }

      // Create notification records (only if not already created by 24h reminder)
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: booking.organizerId,
          bookingId: booking.id,
          type: 'CONFIRMATION_REMINDER',
          createdAt: {
            gte: new Date(now.getTime() - 3 * 60 * 60 * 1000)
          }
        }
      })

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: booking.organizerId,
            bookingId: booking.id,
            title: '2h Match Reminder',
            message: `Your match is in 2 hours at ${booking.location}`,
            type: 'CONFIRMATION_REMINDER'
          }
        })

        if (booking.goalkeeperId) {
          await prisma.notification.create({
            data: {
              userId: booking.goalkeeperId,
              bookingId: booking.id,
              title: '2h Match Reminder',
              message: `Your match is in 2 hours at ${booking.location}`,
              type: 'CONFIRMATION_REMINDER'
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminder emails`,
      reminders24h: bookingsFor24HourReminder.length,
      reminders2h: bookingsFor2HourReminder.length
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
