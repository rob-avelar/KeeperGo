
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Disable static generation for this dynamic API route
export const dynamic = 'force-dynamic'
