
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Goal as GoalIcon, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { signIn } from 'next-auth/react'

export default function CompleteRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleRoleSelection = async (role: 'ORGANIZER' | 'GOALKEEPER') => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/complete-google-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete registration')
      }

      toast({
        title: 'Success!',
        description: 'Registration completed. Redirecting...',
      })

      // Re-login with Google to refresh the session with the new role
      const dashboard = role === 'GOALKEEPER' ? '/goalkeeper/dashboard' : '/organizer/dashboard'
      await signIn('google', { callbackUrl: dashboard })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <GoalIcon className="h-8 w-8 text-lime-400" />
            <h1 className="text-3xl font-bold text-white">KeeperGo</h1>
          </Link>
          <p className="text-gray-400">Complete Your Registration</p>
        </div>

        <Card className="shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Choose Your Role</CardTitle>
            <CardDescription className="text-center">
              Tell us how you want to use KeeperGo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {email && (
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400">
                  Signing in as: <strong>{email}</strong>
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Organizer Option */}
              <Card 
                className="cursor-pointer hover:shadow-lg shadow-black/20 transition-all border-2 hover:border-lime-400"
                onClick={() => !isLoading && handleRoleSelection('ORGANIZER')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-20 w-20 bg-lime-400/10 rounded-full flex items-center justify-center">
                      <Users className="h-10 w-10 text-lime-400" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">Match Organizer</CardTitle>
                  <CardDescription className="text-center">
                    I want to find and book goalkeepers for my matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelection('ORGANIZER')
                    }}
                  >
                    {isLoading ? 'Processing...' : (
                      <>
                        Continue as Organizer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Goalkeeper Option */}
              <Card 
                className="cursor-pointer hover:shadow-lg shadow-black/20 transition-all border-2 hover:border-lime-400"
                onClick={() => !isLoading && handleRoleSelection('GOALKEEPER')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-20 w-20 bg-lime-400/10 rounded-full flex items-center justify-center">
                      <GoalIcon className="h-10 w-10 text-lime-400" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">Goalkeeper</CardTitle>
                  <CardDescription className="text-center">
                    I want to work as a goalkeeper and accept match invitations
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelection('GOALKEEPER')
                    }}
                  >
                    {isLoading ? 'Processing...' : (
                      <>
                        Continue as Goalkeeper
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center text-sm text-gray-400 mt-6">
              <p>You can always change your role later in settings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
