
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, inviteCode } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['ORGANIZER', 'GOALKEEPER'].includes(role?.toString()?.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if beta mode is enabled
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'settings' }
    })
    const betaModeEnabled = settings?.betaModeEnabled ?? true

    // Validate invite code if beta mode is enabled
    let invite = null
    if (betaModeEnabled) {
      if (!inviteCode) {
        return NextResponse.json(
          { error: 'Invite code required during beta' },
          { status: 400 }
        )
      }

      invite = await prisma.betaInvite.findUnique({
        where: { code: inviteCode.toUpperCase().trim() }
      })

      if (!invite) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 }
        )
      }

      if (invite.usedAt) {
        return NextResponse.json(
          { error: 'Invite code already used' },
          { status: 400 }
        )
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Invite code expired' },
          { status: 400 }
        )
      }

      // Check if invite is restricted to a specific email
      if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'This invite code is reserved for another email' },
          { status: 400 }
        )
      }
    }

    const normalizedRole = role?.toString()?.toUpperCase() as 'ORGANIZER' | 'GOALKEEPER'

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { goalkeeperProfile: true }
    })

    if (existingUser) {
      // If user exists, verify password and allow adding a new role
      if (!existingUser.password) {
        // Google SSO user - they should use Google to sign in
        return NextResponse.json(
          { error: 'This email is registered with Google. Please use Google sign-in.' },
          { status: 400 }
        )
      }

      const isPasswordValid = await bcrypt.compare(password, existingUser.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Email already registered. If this is your account, use the correct password to add this role.' },
          { status: 400 }
        )
      }

      // Switch user to the requested role
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: normalizedRole }
      })

      // Create goalkeeper profile if switching to goalkeeper and profile doesn't exist
      if (normalizedRole === 'GOALKEEPER' && !existingUser.goalkeeperProfile) {
        await prisma.goalkeeperProfile.create({
          data: {
            userId: existingUser.id,
          }
        })
      }

      // Mark invite as used
      if (invite) {
        await prisma.betaInvite.update({
          where: { id: invite.id },
          data: {
            usedBy: existingUser.id,
            usedAt: new Date()
          }
        })
      }

      return NextResponse.json(
        { message: 'Role updated successfully', userId: existingUser.id, roleAdded: true },
        { status: 200 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: normalizedRole,
      }
    })

    // Mark invite as used
    if (invite) {
      await prisma.betaInvite.update({
        where: { id: invite.id },
        data: {
          usedBy: user.id,
          usedAt: new Date()
        }
      })
    }

    // Create goalkeeper profile if user is a goalkeeper
    if (normalizedRole === 'GOALKEEPER') {
      await prisma.goalkeeperProfile.create({
        data: {
          userId: user.id,
        }
      })
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
