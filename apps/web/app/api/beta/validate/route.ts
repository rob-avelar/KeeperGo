import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Validate invite code (public endpoint for signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' })
    }

    const invite = await prisma.betaInvite.findUnique({
      where: { code: code.toUpperCase().trim() }
    })

    if (!invite) {
      return NextResponse.json({ valid: false, error: 'Invalid invite code' })
    }

    if (invite.usedAt) {
      return NextResponse.json({ valid: false, error: 'This invite code has already been used' })
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This invite code has expired' })
    }

    return NextResponse.json({ 
      valid: true, 
      role: invite.role,
      email: invite.email 
    })
  } catch (error) {
    console.error('Error validating invite:', error)
    return NextResponse.json({ valid: false, error: 'Server error' })
  }
}
