
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, User, Mail, Lock, ArrowRight, Ticket, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { signIn } from 'next-auth/react'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'ORGANIZER' | 'GOALKEEPER'>('ORGANIZER')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [betaModeEnabled, setBetaModeEnabled] = useState(false)
  const [checkingBeta, setCheckingBeta] = useState(true)
  const [validatingCode, setValidatingCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  // Check if beta mode is enabled
  useEffect(() => {
    const checkBetaMode = async () => {
      try {
        const res = await fetch('/api/beta/status')
        const data = await res.json()
        setBetaModeEnabled(data.betaModeEnabled)
      } catch {
        setBetaModeEnabled(false)
      } finally {
        setCheckingBeta(false)
      }
    }
    checkBetaMode()
  }, [])

  // Validate invite code
  const validateInviteCode = async (code: string) => {
    if (!code || code.length < 5) {
      setInviteValid(null)
      setInviteError('')
      return
    }

    setValidatingCode(true)
    try {
      const res = await fetch('/api/beta/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      
      setInviteValid(data.valid)
      setInviteError(data.valid ? '' : data.error)
      
      // If invite has a specific role, set it
      if (data.valid && data.role) {
        setRole(data.role)
      }
      // If invite has a specific email, set it
      if (data.valid && data.email) {
        setEmail(data.email)
      }
    } catch {
      setInviteValid(false)
      setInviteError('Error validating code')
    } finally {
      setValidatingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Check invite code in beta mode
    if (betaModeEnabled && !inviteValid) {
      setError('Valid invite code required')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          inviteCode: betaModeEnabled ? inviteCode : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      toast({
        title: 'Success',
        description: 'Account created successfully! Signing you in...',
      })

      // Automatically sign in after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push('/auth/signin')
      } else {
        if (role === 'GOALKEEPER') {
          router.replace('/goalkeeper/dashboard')
        } else {
          router.replace('/organizer/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingBeta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">KeeperGo</h1>
          <p className="text-gray-400">Create your account</p>
          {betaModeEnabled && (
            <div className="mt-2 inline-flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <Ticket className="w-4 h-4" />
              Beta - Invite code required
            </div>
          )}
        </div>

        <Card className="shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Join KeeperGo</CardTitle>
            <CardDescription className="text-center">
              {betaModeEnabled 
                ? 'Enter your invite code to create an account' 
                : 'Choose your role and create your account'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Beta Invite Code */}
              {betaModeEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="KEEPER-XXXXXXXX"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value.toUpperCase())
                        validateInviteCode(e.target.value)
                      }}
                      className={`pl-10 pr-10 uppercase ${
                        inviteValid === true ? 'border-green-500 focus-visible:ring-green-500' : 
                        inviteValid === false ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                      required
                    />
                    {validatingCode && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
                    )}
                    {!validatingCode && inviteValid === true && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                    {!validatingCode && inviteValid === false && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {inviteError && (
                    <p className="text-sm text-red-500">{inviteError}</p>
                  )}
                  {inviteValid && (
                    <p className="text-sm text-green-600">Valid invite code!</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Label>I want to...</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'ORGANIZER' | 'GOALKEEPER')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ORGANIZER" id="organizer" />
                    <Label htmlFor="organizer">Book goalkeepers for my matches</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GOALKEEPER" id="goalkeeper" />
                    <Label htmlFor="goalkeeper">Work as a goalkeeper</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-800 text-gray-200"
                disabled={isLoading}
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-400">Already have an account? </span>
                <Link 
                  href="/auth/signin" 
                  className="text-lime-400 hover:text-lime-500 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
