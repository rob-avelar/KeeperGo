export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    })

    // Create new token (expires in 1 hour)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires,
      },
    })

    const appUrl = process.env.NEXTAUTH_URL || 'https://www.keepergo.nl'
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    await sendNotificationEmail({
      recipientEmail: email,
      subject: 'Reset your KeeperGo password',
      htmlBody: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #a3e635;">Reset your password</h2>
          <p>Hi ${user.name ?? 'there'},</p>
          <p>Click the button below to reset your KeeperGo password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#a3e635;color:#111827;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:13px;">If you didn't request this, ignore this email.</p>
          <p style="color:#6b7280;font-size:13px;">Or copy this link: ${resetUrl}</p>
        </div>
      `,
      notificationId: 'password-reset',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
