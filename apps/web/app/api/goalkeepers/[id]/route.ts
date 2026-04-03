import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const profile = await prisma.goalkeeperProfile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Goleiro não encontrado' }, { status: 404 })
  }

  return NextResponse.json(profile)
}
