
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAccountStatus } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { goalkeeperProfile: true }
    })

    if (!user || user.role !== 'GOALKEEPER') {
      return NextResponse.json(
        { error: 'Only goalkeepers can access this endpoint' },
        { status: 403 }
      )
    }

    if (!user.goalkeeperProfile?.stripeAccountId) {
      return NextResponse.json({
        hasAccount: false,
        status: 'none'
      })
    }

    // Get account status from Stripe
    const status = await getAccountStatus(user.goalkeeperProfile.stripeAccountId)

    // Update local database with latest status
    await prisma.goalkeeperProfile.update({
      where: { userId: user.id },
      data: {
        stripeDetailsSubmitted: status.detailsSubmitted || false,
        stripeChargesEnabled: status.chargesEnabled || false,
        stripePayoutsEnabled: status.payoutsEnabled || false,
        stripeAccountStatus: status.detailsSubmitted 
          ? (status.payoutsEnabled ? 'complete' : 'pending')
          : 'incomplete'
      }
    })

    return NextResponse.json({
      hasAccount: true,
      accountId: status.id,
      detailsSubmitted: status.detailsSubmitted,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      requirements: status.requirements,
      status: status.detailsSubmitted 
        ? (status.payoutsEnabled ? 'complete' : 'pending')
        : 'incomplete'
    })

  } catch (error) {
    console.error('Error getting account status:', error)
    return NextResponse.json(
      { error: 'Failed to get account status' },
      { status: 500 }
    )
  }
}
