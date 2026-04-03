import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET - List beta invites and settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'

    // Build filter
    const where: Record<string, unknown> = {}
    if (status === 'used') {
      where.usedAt = { not: null }
    } else if (status === 'available') {
      where.usedAt = null
    }

    const [invites, total, settings] = await Promise.all([
      prisma.betaInvite.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.betaInvite.count({ where }),
      prisma.appSettings.findUnique({ where: { id: 'settings' } })
    ])

    // Stats
    const stats = await prisma.betaInvite.groupBy({
      by: ['usedBy'],
      _count: true
    })
    
    const totalInvites = await prisma.betaInvite.count()
    const usedInvites = await prisma.betaInvite.count({ where: { usedAt: { not: null } } })

    return NextResponse.json({
      invites,
      settings: settings || { betaModeEnabled: true },
      stats: {
        total: totalInvites,
        used: usedInvites,
        available: totalInvites - usedInvites
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching beta data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new invite codes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { count = 1, email, role, notes, expiresInDays } = body

    const invites = []
    for (let i = 0; i < Math.min(count, 50); i++) {
      const code = `KEEPER-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
      
      const invite = await prisma.betaInvite.create({
        data: {
          code,
          email: email || null,
          role: role || null,
          notes: notes || null,
          expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null
        }
      })
      invites.push(invite)
    }

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update settings or invite
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { betaModeEnabled, inviteId, action } = body

    // Update beta mode setting
    if (typeof betaModeEnabled === 'boolean') {
      const settings = await prisma.appSettings.upsert({
        where: { id: 'settings' },
        update: { betaModeEnabled },
        create: { id: 'settings', betaModeEnabled }
      })
      return NextResponse.json({ settings })
    }

    // Delete invite
    if (inviteId && action === 'delete') {
      await prisma.betaInvite.delete({ where: { id: inviteId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating beta settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
