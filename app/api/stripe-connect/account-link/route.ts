
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAccountLink } from '@/lib/stripe'

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'No Stripe account found. Please create one first.' },
        { status: 404 }
      )
    }

    // Get origin from request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    
    const returnUrl = `${origin}/goalkeeper/bank-account?success=true`
    const refreshUrl = `${origin}/goalkeeper/bank-account?refresh=true`

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      user.goalkeeperProfile.stripeAccountId,
      returnUrl,
      refreshUrl
    )

    // Update profile with onboarding link and expiration
    await prisma.goalkeeperProfile.update({
      where: { userId: user.id },
      data: {
        stripeOnboardingLink: accountLink.url,
        stripeLinkExpiresAt: new Date(accountLink.expires_at * 1000)
      }
    })

    return NextResponse.json({
      url: accountLink.url,
      expiresAt: accountLink.expires_at
    })

  } catch (error) {
    console.error('Error creating account link:', error)
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
