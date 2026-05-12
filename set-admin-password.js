/**
 * Script to set a password for a Google OAuth account
 * Usage: node set-admin-password.js <email> <new-password>
 */
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('./packages/database/generated/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Usage: node set-admin-password.js <email> <new-password>')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { email },
    data: { password: hash },
  })

  console.log(`✓ Password set for ${email} (role: ${user.role})`)
  console.log('You can now log in on the mobile app with this email and password.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
