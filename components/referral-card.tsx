'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Gift, Copy, Users, CheckCircle, Share2, Euro, Loader2 } from 'lucide-react'

interface ReferralData {
  referralCode: string
  totalReferred: number
  signedUp: number
  completed: number
  totalEarned: number
  referrals: Array<{
    id: string
    status: string
    referrerRewarded: boolean
    rewardAmount: number
    createdAt: string
    referred: {
      name: string | null
      email: string
      role: string
      createdAt: string
    } | null
  }>
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/referral')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const copyLink = () => {
    if (!data) return
    const link = `${window.location.origin}?ref=${data.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast({ title: 'Link copied!', description: 'Share it with your friends' })
    setTimeout(() => setCopied(false), 3000)
  }

  const copyCode = () => {
    if (!data) return
    navigator.clipboard.writeText(data.referralCode)
    setCopied(true)
    toast({ title: 'Code copied!', description: data.referralCode })
    setTimeout(() => setCopied(false), 3000)
  }

  const shareLink = () => {
    if (!data) return
    const link = `${window.location.origin}?ref=${data.referralCode}`
    const text = 'Join KeeperGo - the #1 goalkeeper rental platform in the Netherlands! Use my referral link and we both get \u20ac5 off:'
    if (navigator.share) {
      navigator.share({ title: 'KeeperGo Referral', text, url: link })
    } else {
      copyLink()
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-lime-400" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-lime-400/10">
            <Gift className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <CardTitle className="text-gray-100">Invite Friends & Earn \u20ac5</CardTitle>
            <CardDescription className="text-gray-400">
              Share your link — you both get \u20ac5 off after their first booking
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="bg-gray-800 rounded-lg p-4 border border-lime-400/20">
          <p className="text-xs text-gray-400 mb-1">Your referral code</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono font-bold text-lime-400">{data.referralCode}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyCode} className="border-gray-700 text-gray-300 hover:text-lime-400 hover:border-lime-400">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="sm" onClick={shareLink} className="bg-lime-400 text-gray-950 hover:bg-lime-300">
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-100">{data.totalReferred}</p>
            <p className="text-xs text-gray-400">Invited</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <CheckCircle className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-100">{data.completed}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <Euro className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-lime-400">\u20ac{(data.totalEarned / 100).toFixed(0)}</p>
            <p className="text-xs text-gray-400">Earned</p>
          </div>
        </div>

        {/* Recent Referrals */}
        {data.referrals.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Recent Referrals</p>
            <div className="space-y-2">
              {data.referrals.slice(0, 5).map(ref => (
                <div key={ref.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm text-gray-200">{ref.referred?.name || ref.referred?.email || 'Pending'}</p>
                    <p className="text-xs text-gray-400">{ref.referred?.role || ''}</p>
                  </div>
                  <Badge className={
                    ref.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    ref.status === 'SIGNED_UP' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                    'bg-gray-700 text-gray-400 border-gray-600'
                  }>
                    {ref.status === 'COMPLETED' ? '\u20ac5 Earned' : ref.status === 'SIGNED_UP' ? 'Signed Up' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
