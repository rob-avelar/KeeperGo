import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export function generateReferralCode(): string {
  return 'KG-' + crypto.randomBytes(4).toString('hex').toUpperCase()
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true }
  })

  if (user?.referralCode) {
    return user.referralCode
  }

  const code = generateReferralCode()
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code }
  })

  return code
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referred: {
        select: { name: true, email: true, role: true, createdAt: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const totalReferred = referrals.length
  const signedUp = referrals.filter(r => r.status === 'SIGNED_UP' || r.status === 'COMPLETED').length
  const completed = referrals.filter(r => r.status === 'COMPLETED').length
  const totalEarned = referrals.filter(r => r.referrerRewarded).reduce((sum, r) => sum + r.rewardAmount, 0)

  return {
    referrals,
    totalReferred,
    signedUp,
    completed,
    totalEarned
  }
}
