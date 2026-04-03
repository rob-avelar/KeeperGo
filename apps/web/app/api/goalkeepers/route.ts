
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get('lat')
    const longitude = searchParams.get('lng')
    const radius = searchParams.get('radius') || '20'
    const fieldType = searchParams.get('fieldType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const experienceLevel = searchParams.get('experienceLevel')

    let whereClause: any = {
      isActive: true,
      user: {
        role: 'GOALKEEPER'
      }
    }

    // Filter by field type
    if (fieldType) {
      whereClause.preferredFields = {
        has: fieldType
      }
    }

    // Filter by minimum rating
    if (minRating) {
      whereClause.averageRating = {
        gte: parseFloat(minRating)
      }
    }

    // Filter by experience level
    if (experienceLevel && experienceLevel !== 'all') {
      whereClause.experienceLevel = experienceLevel
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      if (!whereClause.AND) whereClause.AND = []
      if (minPrice) {
        whereClause.AND.push({
          hourlyRateMin: { gte: parseInt(minPrice) * 100 }
        })
      }
      if (maxPrice) {
        whereClause.AND.push({
          hourlyRateMax: { lte: parseInt(maxPrice) * 100 }
        })
      }
    }

    const goalkeepers = await prisma.goalkeeperProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        averageRating: 'desc'
      }
    })

    // If location provided, filter by distance (simple approximation)
    let filteredGoalkeepers = goalkeepers
    if (latitude && longitude) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      const radiusKm = parseFloat(radius)

      filteredGoalkeepers = goalkeepers.filter(gk => {
        if (!gk.latitude || !gk.longitude) return false
        
        const distance = calculateDistance(lat, lng, gk.latitude, gk.longitude)
        return distance <= radiusKm
      })
    }

    return NextResponse.json(filteredGoalkeepers)
  } catch (error) {
    console.error('Error fetching goalkeepers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Simple distance calculation using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
