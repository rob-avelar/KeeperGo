import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/referral'

export const dynamic = 'force-dynamic'

// POST: Track a referral after signup
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { referralCode } = await req.json()

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 })
    }

    // Find the referrer
    const referrer = await prisma.user.findFirst({
      where: { referralCode }
    })

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Don't allow self-referral
    if (referrer.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    // Check if already referred
    const existingReferral = await prisma.referral.findFirst({
      where: { referredId: session.user.id }
    })

    if (existingReferral) {
      return NextResponse.json({ error: 'Already referred' }, { status: 400 })
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: session.user.id,
        referralCode: generateReferralCode() + '-' + Date.now(),
        status: 'SIGNED_UP',
        usedAt: new Date()
      }
    })

    // Update referred user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { referredByCode: referralCode }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
