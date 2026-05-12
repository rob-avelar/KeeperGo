export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          image: payload.picture || null,
          role: null,
        },
      })
    } else {
      await prisma.user.update({
        where: { email: payload.email },
        data: {
          name: payload.name || user.name,
          image: payload.picture || user.image,
        },
      })
    }

    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '30d' }
    )

    return NextResponse.json({ sessionToken, user: { id: user.id, email: user.email, role: user.role, name: user.name } })
  } catch (error) {
    console.error('Google mobile auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
