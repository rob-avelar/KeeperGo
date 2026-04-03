'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, ExternalLink, Banknote, RefreshCw } from 'lucide-react'

interface AccountStatus {
  hasAccount: boolean
  accountId?: string
  detailsSubmitted?: boolean
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  status: string
  requirements?: {
    currently_due?: string[]
    eventually_due?: string[]
    past_due?: string[]
  }
}

export default function BankAccountPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const success = searchParams.get('success')
  const refresh = searchParams.get('refresh')

  useEffect(() => {
    fetchAccountStatus()
  }, [])

  useEffect(() => {
    if (success === 'true') {
      toast({
        title: 'Success!',
        description: 'Your bank account details have been submitted. It may take a moment to verify.',
      })
    }
    if (refresh === 'true') {
      toast({
        title: 'Session Expired',
        description: 'Your onboarding session expired. Please try again.',
        variant: 'destructive',
      })
    }
  }, [success, refresh])

  const fetchAccountStatus = async () => {
    try {
      const res = await fetch('/api/stripe-connect/account-status')
      const data = await res.json()
      setAccountStatus(data)
    } catch (error) {
      console.error('Error fetching account status:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch account status.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnectAccount = async () => {
    setActionLoading(true)
    try {
      // Step 1: Create Stripe Connect account if needed
      const createRes = await fetch('/api/stripe-connect/create-account', { method: 'POST' })
      const createData = await createRes.json()

      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to create account')
      }

      // Step 2: Get onboarding link
      const linkRes = await fetch('/api/stripe-connect/account-link', { method: 'POST' })
      const linkData = await linkRes.json()

      if (!linkRes.ok) {
        throw new Error(linkData.error || 'Failed to create onboarding link')
      }

      // Step 3: Redirect to Stripe onboarding
      window.location.href = linkData.url

    } catch (error: any) {
      console.error('Error connecting account:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to start Stripe onboarding.',
        variant: 'destructive',
      })
      setActionLoading(false)
    }
  }

  const handleViewDashboard = async () => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/stripe-connect/dashboard-link', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create dashboard link')
      }

      window.open(data.url, '_blank')
    } catch (error: any) {
      console.error('Error opening dashboard:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to open Stripe dashboard.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleContinueOnboarding = async () => {
    setActionLoading(true)
    try {
      const linkRes = await fetch('/api/stripe-connect/account-link', { method: 'POST' })
      const linkData = await linkRes.json()

      if (!linkRes.ok) {
        throw new Error(linkData.error || 'Failed to create onboarding link')
      }

      window.location.href = linkData.url
    } catch (error: any) {
      console.error('Error continuing onboarding:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to continue onboarding.',
        variant: 'destructive',
      })
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/goalkeeper/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">KeeperGo</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Bank Account & Payments</h2>

        {/* No Account Yet */}
        {!accountStatus?.hasAccount && (
          <Card className="border-yellow-700 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Banknote className="w-8 h-8 text-yellow-600" />
                <div>
                  <CardTitle className="text-yellow-800">Connect Your Bank Account</CardTitle>
                  <CardDescription className="text-yellow-700">
                    To receive payments for your goalkeeper services, you need to connect a bank account through Stripe.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-yellow-700">
                  <h4 className="font-semibold text-gray-100 mb-2">How it works:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-lime-400">1.</span>
                      Click the button below to start the setup
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-lime-400">2.</span>
                      Stripe will guide you through providing your details
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-lime-400">3.</span>
                      Once verified, you&apos;ll receive 75% of each booking payment directly
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={handleConnectAccount}
                  disabled={actionLoading}
                  className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950 text-white"
                  size="lg"
                >
                  {actionLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
                  ) : (
                    <><Banknote className="w-4 h-4 mr-2" /> Connect Bank Account via Stripe</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Incomplete */}
        {accountStatus?.hasAccount && accountStatus.status === 'incomplete' && (
          <Card className="border-orange-700 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <CardTitle className="text-orange-800">Setup Incomplete</CardTitle>
                  <CardDescription className="text-orange-700">
                    Your Stripe account has been created but the setup is not complete. Please finish providing your details.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountStatus.requirements?.currently_due && accountStatus.requirements.currently_due.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-4 border border-orange-700">
                    <h4 className="font-semibold text-gray-100 mb-2">Information needed:</h4>
                    <p className="text-sm text-gray-400">Stripe requires additional information to verify your identity and enable payments.</p>
                  </div>
                )}
                <Button
                  onClick={handleContinueOnboarding}
                  disabled={actionLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  {actionLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" /> Continue Setup on Stripe</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Pending */}
        {accountStatus?.hasAccount && accountStatus.status === 'pending' && (
          <Card className="border-gray-700 bg-lime-400/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-8 h-8 text-lime-400" />
                <div>
                  <CardTitle className="text-white">Verification in Progress</CardTitle>
                  <CardDescription className="text-lime-500">
                    Your details have been submitted and are being verified by Stripe. This usually takes 1-2 business days.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Details Submitted</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Charges Enabled</span>
                    {accountStatus.chargesEnabled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Payouts Enabled</span>
                    {accountStatus.payoutsEnabled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
                    )}
                  </div>
                </div>
                <Button
                  onClick={fetchAccountStatus}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Complete */}
        {accountStatus?.hasAccount && accountStatus.status === 'complete' && (
          <Card className="border-green-700 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <CardTitle className="text-green-800">Bank Account Active</CardTitle>
                  <CardDescription className="text-green-700">
                    Your bank account is fully set up. You&apos;ll receive 75% of each booking payment directly to your bank account.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg p-4 border border-green-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Details Submitted</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Charges Enabled</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Payouts Enabled</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <Button
                  onClick={handleViewDashboard}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {actionLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" /> View Stripe Dashboard</>
                  )}
                </Button>
                <Button
                  onClick={fetchAccountStatus}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
