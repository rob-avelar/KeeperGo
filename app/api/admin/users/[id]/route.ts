import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        goalkeeperProfile: true,
        organizerBookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            goalkeeper: { select: { name: true } },
          },
        },
        goalkeeperBookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            organizer: { select: { name: true } },
          },
        },
        ratingsReceived: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            rater: { select: { name: true } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { action, reason } = body

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { goalkeeperProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'block' && user.goalkeeperProfile) {
      await prisma.goalkeeperProfile.update({
        where: { userId: params.id },
        data: {
          isBlocked: true,
          blockReason: reason || 'Blocked by admin',
        },
      })
      return NextResponse.json({ message: 'User blocked successfully' })
    }

    if (action === 'unblock' && user.goalkeeperProfile) {
      await prisma.goalkeeperProfile.update({
        where: { userId: params.id },
        data: {
          isBlocked: false,
          blockReason: null,
          warnings: 0,
        },
      })
      return NextResponse.json({ message: 'User unblocked successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
