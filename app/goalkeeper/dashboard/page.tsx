
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import GoalkeeperDashboard from '@/components/goalkeeper-dashboard'

export default async function GoalkeeperDashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Auto-switch role to GOALKEEPER when accessing this dashboard
  if (session.user.role !== 'GOALKEEPER') {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'GOALKEEPER' }
    })

    // Ensure goalkeeper profile exists
    const existingProfile = await prisma.goalkeeperProfile.findUnique({
      where: { userId: session.user.id }
    })
    if (!existingProfile) {
      await prisma.goalkeeperProfile.create({
        data: {
          userId: session.user.id,
          bio: '',
          experienceLevel: 'BEGINNER',
          preferredFields: [],
          serviceRadius: 10,
          hourlyRateMin: 2000,
          hourlyRateMax: 3000,
        }
      })
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      goalkeeperProfile: true,
      goalkeeperBookings: {
        include: {
          organizer: true,
          ratings: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return <GoalkeeperDashboard user={user} />
}
