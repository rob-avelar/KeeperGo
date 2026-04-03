
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

export function SessionProvider({ 
  children, 
  session 
}: { 
  children: React.ReactNode
  session: any
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
