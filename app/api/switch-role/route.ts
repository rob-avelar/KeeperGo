export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['ORGANIZER', 'GOALKEEPER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { goalkeeperProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the active role
    await prisma.user.update({
      where: { id: user.id },
      data: { role }
    })

    // If switching to GOALKEEPER, ensure goalkeeper profile exists
    if (role === 'GOALKEEPER' && !user.goalkeeperProfile) {
      await prisma.goalkeeperProfile.create({
        data: {
          userId: user.id,
          bio: '',
          experienceLevel: 'BEGINNER',
          preferredFields: [],
          serviceRadius: 10,
          hourlyRateMin: 2000,
          hourlyRateMax: 3000,
        }
      })
    }

    return NextResponse.json({ success: true, role }, { status: 200 })
  } catch (error) {
    console.error('Error switching role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
