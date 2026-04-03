
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Check if a goalkeeper is favorited
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ isFavorite: false })
    }

    const { searchParams } = new URL(req.url)
    const goalkeeperId = searchParams.get('goalkeeperId')

    if (!goalkeeperId) {
      return NextResponse.json({ error: 'Goalkeeper ID is required' }, { status: 400 })
    }

    const favorite = await prisma.favoriteGoalkeeper.findUnique({
      where: {
        organizerId_goalkeeperId: {
          organizerId: session.user.id,
          goalkeeperId,
        },
      },
    })

    return NextResponse.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Error checking favorite:', error)
    return NextResponse.json({ error: 'Failed to check favorite' }, { status: 500 })
  }
}
