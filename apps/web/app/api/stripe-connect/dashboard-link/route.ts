
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createLoginLink } from '@/lib/stripe'

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
        { error: 'No Stripe account found' },
        { status: 404 }
      )
    }

    // Create login link for Express Dashboard
    const loginLink = await createLoginLink(user.goalkeeperProfile.stripeAccountId)

    return NextResponse.json({
      url: loginLink.url
    })

  } catch (error) {
    console.error('Error creating dashboard link:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard link' },
      { status: 500 }
    )
  }
}
