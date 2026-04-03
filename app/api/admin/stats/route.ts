import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get date ranges
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count users
    const [totalUsers, totalOrganizers, totalGoalkeepers, newUsersToday, newUsersWeek, newUsersMonth] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { role: 'ORGANIZER' } }),
      prisma.user.count({ where: { role: 'GOALKEEPER' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfToday }, role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek }, role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth }, role: { not: 'ADMIN' } } }),
    ])

    // Count bookings
    const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ])

    // Revenue stats
    const completedPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    })

    const platformRevenue = await prisma.payment.aggregate({
      _sum: { platformFee: true },
      where: { status: 'COMPLETED' },
    })

    // Recent registrations (last 7 days by day)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      
      const count = await prisma.user.count({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay },
          role: { not: 'ADMIN' },
        },
      })
      
      last7Days.push({
        date: startOfDay.toISOString().split('T')[0],
        count,
      })
    }

    // Top goalkeepers by rating
    const topGoalkeepers = await prisma.goalkeeperProfile.findMany({
      take: 5,
      orderBy: { averageRating: 'desc' },
      where: { averageRating: { gt: 0 } },
      include: { user: { select: { name: true, email: true } } },
    })

    return NextResponse.json({
      users: {
        total: totalUsers,
        organizers: totalOrganizers,
        goalkeepers: totalGoalkeepers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        totalTransactions: (completedPayments._sum.amount || 0) / 100,
        platformRevenue: (platformRevenue._sum.platformFee || 0) / 100,
      },
      registrationTrend: last7Days,
      topGoalkeepers: topGoalkeepers.map(gk => ({
        name: gk.user.name,
        email: gk.user.email,
        rating: gk.averageRating,
        totalMatches: gk.totalMatches,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
