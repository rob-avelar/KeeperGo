
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createConnectAccount } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only goalkeepers can create connect accounts
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { goalkeeperProfile: true }
    })

    if (!user || user.role !== 'GOALKEEPER') {
      return NextResponse.json(
        { error: 'Only goalkeepers can connect bank accounts' },
        { status: 403 }
      )
    }

    if (!user.goalkeeperProfile) {
      return NextResponse.json(
        { error: 'Goalkeeper profile not found' },
        { status: 404 }
      )
    }

    // Check if already has a Stripe account
    if (user.goalkeeperProfile.stripeAccountId) {
      return NextResponse.json({
        accountId: user.goalkeeperProfile.stripeAccountId,
        alreadyExists: true
      })
    }

    // Create Stripe Connect Express account
    const account = await createConnectAccount(user.email, 'NL') // Netherlands

    // Update goalkeeper profile with Stripe account ID
    await prisma.goalkeeperProfile.update({
      where: { userId: user.id },
      data: {
        stripeAccountId: account.id,
        stripeAccountStatus: 'incomplete',
        stripeDetailsSubmitted: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      }
    })

    return NextResponse.json({
      accountId: account.id,
      created: true
    })

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
