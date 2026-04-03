import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral'

export const dynamic = 'force-dynamic'

// GET: Get current user's referral code and stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const referralCode = await getOrCreateReferralCode(session.user.id)
    const stats = await getReferralStats(session.user.id)

    return NextResponse.json({
      referralCode,
      ...stats
    })
  } catch (error) {
    console.error('Error fetching referral data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Validate a referral code (used during signup)
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const referrer = await prisma.user.findFirst({
      where: { referralCode: code },
      select: { id: true, name: true }
    })

    if (!referrer) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' })
    }

    return NextResponse.json({ valid: true, referrerName: referrer.name })
  } catch (error) {
    console.error('Error validating referral:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
