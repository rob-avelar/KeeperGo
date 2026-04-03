
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Only organizers can view analytics' }, { status: 403 })
    }

    const organizerId = session.user.id

    // Get all completed bookings
    const completedBookings = await prisma.booking.findMany({
      where: {
        organizerId,
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        isCompleted: true,
      },
      include: {
        goalkeeper: {
          include: {
            goalkeeperProfile: true
          }
        },
        ratings: {
          where: {
            raterId: organizerId
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calculate monthly activity and positive metrics
    const monthlyMatches: { [key: string]: number } = {}
    const monthlyDuration: { [key: string]: number } = {}
    const goalkeeperFrequency: { [key: string]: { name: string, count: number, totalRating: number, ratingCount: number } } = {}
    const hourFrequency: { [key: number]: number } = {}
    const fieldTypeFrequency: { [key: string]: number } = {}

    completedBookings.forEach(booking => {
      const date = new Date(booking.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      // Monthly matches
      monthlyMatches[monthKey] = (monthlyMatches[monthKey] || 0) + 1
      
      // Monthly total duration (hours)
      monthlyDuration[monthKey] = (monthlyDuration[monthKey] || 0) + (booking.duration || 0)

      // Goalkeeper frequency with ratings
      if (booking.goalkeeperId) {
        const gkName = booking.goalkeeper?.name || booking.goalkeeper?.email?.split('@')[0] || 'Unknown'
        if (!goalkeeperFrequency[booking.goalkeeperId]) {
          goalkeeperFrequency[booking.goalkeeperId] = {
            name: gkName,
            count: 0,
            totalRating: 0,
            ratingCount: 0
          }
        }
        goalkeeperFrequency[booking.goalkeeperId].count++
        
        // Add ratings if available
        if (booking.ratings && booking.ratings.length > 0) {
          const rating = booking.ratings[0].overallRating
          goalkeeperFrequency[booking.goalkeeperId].totalRating += rating
          goalkeeperFrequency[booking.goalkeeperId].ratingCount++
        }
      }

      // Hour frequency (when matches are scheduled)
      const hour = date.getHours()
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1

      // Field type frequency
      if (booking.fieldType) {
        fieldTypeFrequency[booking.fieldType] = (fieldTypeFrequency[booking.fieldType] || 0) + 1
      }
    })

    // Format monthly data for charts
    const monthlyData = Object.entries(monthlyMatches)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, matches]) => ({
        month,
        matches,
        totalHours: monthlyDuration[month] || 0
      }))

    // Top goalkeepers (sorted by matches, with average ratings)
    const topGoalkeepers = Object.entries(goalkeeperFrequency)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        matches: data.count,
        avgRating: data.ratingCount > 0 ? Math.round((data.totalRating / data.ratingCount) * 10) / 10 : 0
      }))

    // Peak hours
    const peakHours = Object.entries(hourFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        matches: count
      }))

    // Field types
    const fieldTypes = Object.entries(fieldTypeFrequency)
      .map(([type, count]) => ({
        type,
        count
      }))

    // Calculate totals and averages
    const totalMatches = completedBookings.length
    const totalHoursPlayed = completedBookings.reduce((sum, b) => sum + (b.duration || 0), 0)
    const avgMatchDuration = totalMatches > 0 ? totalHoursPlayed / totalMatches : 0
    
    const ratingsGiven = completedBookings.flatMap(b => b.ratings)
    const avgRatingGiven = ratingsGiven.length > 0
      ? ratingsGiven.reduce((sum, r) => sum + r.overallRating, 0) / ratingsGiven.length
      : 0

    // Get current month matches
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentMonthMatches = monthlyMatches[currentMonthKey] || 0

    // Get last month for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`
    const lastMonthMatches = monthlyMatches[lastMonthKey] || 0

    const activityTrend = lastMonthMatches > 0
      ? ((currentMonthMatches - lastMonthMatches) / lastMonthMatches) * 100
      : 0

    return NextResponse.json({
      summary: {
        totalMatches,
        totalHoursPlayed,
        avgMatchDuration: Math.round(avgMatchDuration * 10) / 10,
        avgRatingGiven: Math.round(avgRatingGiven * 10) / 10,
        currentMonthMatches,
        activityTrend: Math.round(activityTrend)
      },
      charts: {
        monthlyData,
        topGoalkeepers,
        peakHours,
        fieldTypes
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
