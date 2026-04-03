
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get notification preferences
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        notifyBookingAccepted: true,
        notifyBookingCancelled: true,
        notifyMatchReminder24h: true,
        notifyMatchReminder2h: true,
        notifyPaymentReceived: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// PUT - Update notification preferences
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: preferences.emailNotifications,
        notifyBookingAccepted: preferences.notifyBookingAccepted,
        notifyBookingCancelled: preferences.notifyBookingCancelled,
        notifyMatchReminder24h: preferences.notifyMatchReminder24h,
        notifyMatchReminder2h: preferences.notifyMatchReminder2h,
        notifyPaymentReceived: preferences.notifyPaymentReceived
      },
      select: {
        emailNotifications: true,
        notifyBookingAccepted: true,
        notifyBookingCancelled: true,
        notifyMatchReminder24h: true,
        notifyMatchReminder2h: true,
        notifyPaymentReceived: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
