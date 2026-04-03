
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all favorite goalkeepers for the current organizer
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Only organizers can have favorites' }, { status: 403 })
    }

    const favorites = await prisma.favoriteGoalkeeper.findMany({
      where: {
        organizerId: session.user.id,
      },
      include: {
        goalkeeper: {
          include: {
            goalkeeperProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST - Add a goalkeeper to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Only organizers can add favorites' }, { status: 403 })
    }

    const { goalkeeperId } = await req.json()

    if (!goalkeeperId) {
      return NextResponse.json({ error: 'Goalkeeper ID is required' }, { status: 400 })
    }

    // Verify that the goalkeeper exists and has the GOALKEEPER role
    const goalkeeper = await prisma.user.findFirst({
      where: {
        id: goalkeeperId,
        role: 'GOALKEEPER',
      },
    })

    if (!goalkeeper) {
      return NextResponse.json({ error: 'Goalkeeper not found' }, { status: 404 })
    }

    // Check if already favorited
    const existing = await prisma.favoriteGoalkeeper.findUnique({
      where: {
        organizerId_goalkeeperId: {
          organizerId: session.user.id,
          goalkeeperId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Goalkeeper already in favorites' }, { status: 400 })
    }

    // Add to favorites
    const favorite = await prisma.favoriteGoalkeeper.create({
      data: {
        organizerId: session.user.id,
        goalkeeperId,
      },
      include: {
        goalkeeper: {
          include: {
            goalkeeperProfile: true,
          },
        },
      },
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }
}

// DELETE - Remove a goalkeeper from favorites
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Only organizers can remove favorites' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const goalkeeperId = searchParams.get('goalkeeperId')

    if (!goalkeeperId) {
      return NextResponse.json({ error: 'Goalkeeper ID is required' }, { status: 400 })
    }

    // Delete the favorite
    await prisma.favoriteGoalkeeper.delete({
      where: {
        organizerId_goalkeeperId: {
          organizerId: session.user.id,
          goalkeeperId,
        },
      },
    })

    return NextResponse.json({ message: 'Removed from favorites' })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}
