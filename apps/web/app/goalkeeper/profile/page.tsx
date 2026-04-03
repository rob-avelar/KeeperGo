
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import GoalkeeperProfileForm from '@/components/goalkeeper-profile-form'

export default async function GoalkeeperProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }


  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      goalkeeperProfile: true
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return <GoalkeeperProfileForm user={user} />
}
