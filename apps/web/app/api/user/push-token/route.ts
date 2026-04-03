import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { pushToken } = await req.json()
  if (!pushToken || typeof pushToken !== 'string') {
    return NextResponse.json({ error: 'pushToken inválido' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushToken },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pushToken: null },
  })

  return NextResponse.json({ success: true })
}
