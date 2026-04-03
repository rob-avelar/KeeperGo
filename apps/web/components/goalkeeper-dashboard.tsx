
'use client'

import { useState, useEffect } from 'react'
import ReferralCard from '@/components/referral-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Calendar,
  MapPin,
  Clock,
  Euro,
  Star,
  Users,
  Activity,
  TrendingUp,
  Goal,
  Settings,
  Award,
  Bell,
  CheckCircle,
  X,
  AlertCircle,
  User,
  ArrowLeftRight
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface GoalkeeperDashboardProps {
  user: any
}

export default function GoalkeeperDashboard({ user }: GoalkeeperDashboardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const profile = user?.goalkeeperProfile
  const bookings = user?.goalkeeperBookings || []

  const [availableBookings, setAvailableBookings] = useState<any[]>([])
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null)
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
  
  // Cancellation state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelFeeInfo, setCancelFeeInfo] = useState<any>(null)
  
  // State for goalkeeper confirmation
  const [confirmingBookingId, setConfirmingBookingId] = useState<string | null>(null)

  const now = new Date()

  const upcomingBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= now && (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED')
  ) || []

  // Bookings where match ended and goalkeeper needs to confirm attendance
  const needsGoalkeeperConfirmation = bookings?.filter((booking: any) => {
    const matchDate = new Date(booking.date)
    const matchEndTime = new Date(matchDate)
    matchEndTime.setHours(matchEndTime.getHours() + (booking.duration || 0))
    
    return (
      matchEndTime < now && // Match has ended
      booking.status === 'CONFIRMED' &&
      !booking.goalkeeperConfirmedAt && // Goalkeeper hasn't confirmed yet
      !booking.confirmedAt && // Organizer hasn't confirmed yet
      !booking.noShow && // Not marked as no-show
      booking.confirmationDeadline &&
      new Date(booking.confirmationDeadline) > now // Still within deadline
    )
  }) || []

  // Bookings awaiting confirmation from organizer (goalkeeper already confirmed)
  const awaitingConfirmation = bookings?.filter((booking: any) => {
    const matchDate = new Date(booking.date)
    const matchEndTime = new Date(matchDate)
    matchEndTime.setHours(matchEndTime.getHours() + (booking.duration || 0))
    
    return (
      matchEndTime < now && // Match has ended
      booking.status === 'CONFIRMED' &&
      booking.goalkeeperConfirmedAt && // Goalkeeper has confirmed
      !booking.confirmedAt && // Organizer hasn't confirmed yet
      !booking.noShow &&
      booking.confirmationDeadline &&
      new Date(booking.confirmationDeadline) > now // Still within deadline
    )
  }) || []

  const completedBookings = bookings?.filter((booking: any) => 
    booking.isCompleted || booking.status === 'COMPLETED'
  ) || []

  // Warning and blocking info
  const warningCount = profile?.warningCount || 0
  const blockedUntil = profile?.blockedUntil ? new Date(profile.blockedUntil) : null
  const isBlocked = blockedUntil && blockedUntil > now

  const totalEarnings = completedBookings?.reduce((sum: number, booking: any) => {
    const goalkeeperEarning = booking.totalAmount * 0.75 // 75% - goalkeeper share
    return sum + goalkeeperEarning
  }, 0) || 0

  const pendingBookings = bookings?.filter((booking: any) => 
    booking.status === 'PENDING'
  ) || []

  // Fetch available bookings
  useEffect(() => {
    fetchAvailableBookings()
  }, [])

  const fetchAvailableBookings = async () => {
    try {
      setIsLoadingAvailable(true)
      const response = await fetch('/api/bookings/available')
      if (response.ok) {
        const data = await response.json()
        setAvailableBookings(data)
      }
    } catch (error) {
      console.error('Error fetching available bookings:', error)
    } finally {
      setIsLoadingAvailable(false)
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setLoadingBookingId(bookingId)
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept booking')
      }

      toast({
        title: 'Success!',
        description: 'You have successfully accepted this match. The organizer has been notified.',
      })

      // Refresh the page to show updated data
      router.refresh()
      
      // Also refresh available bookings
      fetchAvailableBookings()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept booking. It may have been taken by another goalkeeper.',
        variant: 'destructive'
      })
      
      // Refresh available bookings to remove the taken one
      fetchAvailableBookings()
    } finally {
      setLoadingBookingId(null)
    }
  }

  const handleGoalkeeperConfirm = async (bookingId: string) => {
    try {
      setConfirmingBookingId(bookingId)
      const response = await fetch(`/api/bookings/${bookingId}/goalkeeper-confirm`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm attendance')
      }

      toast({
        title: 'Attendance Confirmed!',
        description: data.message || 'The organizer will now validate and rate your performance.',
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to confirm attendance',
        variant: 'destructive'
      })
    } finally {
      setConfirmingBookingId(null)
    }
  }

  const calculateCancellationPreview = (booking: any) => {
    const now = new Date()
    const matchDate = new Date(booking.date)
    const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    const goalkeeperEarnings = Math.round(booking.totalAmount * 0.75) // 75% of total
    let warningLevel = ''
    let message = ''

    if (hoursUntilMatch > 24) {
      warningLevel = 'NONE'
      message = 'Free cancellation - No penalty or warning'
    } else if (hoursUntilMatch > 6) {
      warningLevel = 'LIGHT'
      message = '⚠️ Light warning will be issued (6-24h before match)'
    } else if (hoursUntilMatch > 3) {
      warningLevel = 'MODERATE'
      message = '⚠️⚠️ Moderate warning will be issued (3-6h before match)'
    } else if (hoursUntilMatch > 1) {
      warningLevel = 'SEVERE'
      message = '⚠️⚠️⚠️ SEVERE warning will be issued (1-3h before match)'
    } else {
      warningLevel = 'CRITICAL'
      message = '🚫 CRITICAL: Severe warning + 7-day block (<1h before match)'
    }

    return {
      warningLevel,
      goalkeeperEarnings,
      message,
      hoursUntilMatch: Math.round(hoursUntilMatch * 10) / 10
    }
  }

  const handleOpenCancelDialog = (booking: any) => {
    setBookingToCancel(booking)
    const feeInfo = calculateCancellationPreview(booking)
    setCancelFeeInfo(feeInfo)
    setCancelDialogOpen(true)
  }

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingToCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: cancelReason || 'Cancelled by goalkeeper'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Booking Cancelled',
          description: data.fees.penaltyReason,
        })
        
        setCancelDialogOpen(false)
        setBookingToCancel(null)
        setCancelReason('')
        setCancelFeeInfo(null)
        
        // Refresh page to show updated data
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to cancel booking',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive'
      })
    } finally {
      setCancelling(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      })
    }
  }


  const getTimeUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const hoursLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursLeft < 0) return 'Deadline passed'
    if (hoursLeft < 1) return 'Less than 1 hour left'
    if (hoursLeft < 24) return `${hoursLeft}h left`
    return `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`
  }

  const getWarningBadge = () => {
    if (warningCount === 0) return null
    
    let variant: 'default' | 'destructive' = 'default'
    let text = ''
    
    if (warningCount >= 5) {
      variant = 'destructive'
      text = `${warningCount} Warnings - At Risk`
    } else if (warningCount >= 3) {
      variant = 'destructive'
      text = `${warningCount} Warnings`
    } else {
      text = `${warningCount} Warning${warningCount > 1 ? 's' : ''}`
    }
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {text}
      </Badge>
    )
  }
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Welcome, {user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-lime-400/50 text-lime-400 hover:bg-lime-400/10 hover:text-lime-300"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/switch-role', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ targetRole: 'ORGANIZER' }),
                    })
                    if (!res.ok) {
                      const data = await res.json()
                      toast({ title: 'Error', description: data.error || 'Could not switch role', variant: 'destructive' })
                      return
                    }
                    router.push('/organizer/dashboard')
                  } catch {
                    toast({ title: 'Error', description: 'Could not switch role', variant: 'destructive' })
                  }
                }}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1.5" />
                Organizer Mode
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/goalkeeper/account" className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/goalkeeper/profile" className="flex items-center cursor-pointer">
                      <Award className="h-4 w-4 mr-2" />
                      Professional Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/organizer/settings" className="flex items-center cursor-pointer">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-400">
            Manage your bookings and build your goalkeeper reputation.
          </p>
        </div>

        {/* Blocked Warning */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 text-lg">Account Temporarily Blocked</h3>
                <p className="text-red-800 mt-1">
                  Your account is blocked until{' '}
                  <strong>{blockedUntil?.toLocaleDateString()}</strong> due to recent cancellations or no-shows.
                </p>
                <p className="text-red-700 text-sm mt-2">
                  You cannot accept new bookings during this period. Please ensure better attendance to avoid permanent blocking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning Banner */}
        {!isBlocked && warningCount > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            warningCount >= 5
              ? 'bg-red-900/20 border-red-400'
              : warningCount >= 3
              ? 'bg-orange-50 border-orange-400'
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                warningCount >= 5
                  ? 'text-red-600'
                  : warningCount >= 3
                  ? 'text-orange-600'
                  : 'text-yellow-600'
              }`} />
              <div>
                <h3 className={`font-semibold ${
                  warningCount >= 5
                    ? 'text-red-900'
                    : warningCount >= 3
                    ? 'text-orange-900'
                    : 'text-yellow-900'
                }`}>
                  {warningCount >= 5 ? 'Critical Warning Level' : warningCount >= 3 ? 'Warning Alert' : 'Attention Required'}
                </h3>
                <p className={`text-sm mt-1 ${
                  warningCount >= 5
                    ? 'text-red-800'
                    : warningCount >= 3
                    ? 'text-orange-800'
                    : 'text-yellow-800'
                }`}>
                  You have <strong>{warningCount} warning{warningCount > 1 ? 's' : ''}</strong> on your account.
                  {warningCount >= 5 && ' One more warning may result in permanent blocking.'}
                  {warningCount >= 3 && warningCount < 5 && ' Please avoid late cancellations to prevent blocking.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Your Attendance Banner */}
        {needsGoalkeeperConfirmation?.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  Action Required: Confirm Your Attendance
                </h3>
                <p className="text-green-800 text-sm mt-1">
                  You have <strong>{needsGoalkeeperConfirmation.length} match{needsGoalkeeperConfirmation.length > 1 ? 'es' : ''}</strong> where you need to confirm your attendance.
                  This helps speed up payment processing!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Awaiting Confirmation Banner */}
        {awaitingConfirmation?.length > 0 && (
          <div className="mb-6 p-4 bg-lime-400/5 border-2 border-lime-400/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white">
                  Reminder: Ask Organizer to Confirm Your Attendance
                </h3>
                <p className="text-white text-sm mt-1">
                  You have <strong>{awaitingConfirmation.length} match{awaitingConfirmation.length > 1 ? 'es' : ''}</strong> awaiting organizer confirmation.
                  Please remind the organizer to confirm your attendance in the app to release your payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/goalkeeper/profile">
              <Button className="bg-lime-400 hover:bg-lime-300 text-gray-950">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/goalkeeper/bookings">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View All Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-lime-400 mr-2" />
                <span className="text-2xl font-bold">{profile?.totalMatches || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{profile?.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Euro className="h-4 w-4 text-lime-400 mr-2" />
                <span className="text-2xl font-bold">€{(totalEarnings / 100).toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-2xl font-bold">{pendingBookings?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Status */}
        {(!profile?.bio || !profile?.experienceLevel || !profile?.address || !profile?.city || !profile?.postalCode) && (
          <Card className="mb-8 border-orange-700 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-orange-700">
                Complete your profile to receive more booking requests. Missing: {[
                  !profile?.bio && 'Bio',
                  !profile?.experienceLevel && 'Experience Level',
                  !profile?.address && 'Address',
                  !profile?.city && 'City',
                  !profile?.postalCode && 'Postal Code'
                ].filter(Boolean).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/goalkeeper/profile">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Bank Account Status */}
        {!profile?.stripePayoutsEnabled && (
          <Card className="mb-8 border-gray-700 bg-lime-400/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Euro className="h-5 w-5 mr-2" />
                Bank Account Required
              </CardTitle>
              <CardDescription className="text-lime-500">
                {!profile?.stripeAccountId 
                  ? 'Connect your bank account to receive payments for your goalkeeper services'
                  : 'Complete your bank account setup to start receiving payments'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/goalkeeper/bank-account">
                <Button className="bg-lime-400 hover:bg-lime-300 text-gray-950">
                  {!profile?.stripeAccountId ? 'Connect Bank Account' : 'Complete Setup'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {profile?.stripePayoutsEnabled && (
          <Card className="mb-8 border-green-700 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Bank Account Connected
              </CardTitle>
              <CardDescription className="text-green-700">
                Your bank account is active. You'll receive 75% of each booking payment after confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/goalkeeper/bank-account">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100">
                  View Bank Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Available Matches - First Come First Served */}
        {availableBookings?.length > 0 && (
          <Card className="mb-8 border-lime-400/20 bg-lime-400/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Available Matches
              </CardTitle>
              <CardDescription className="text-lime-500">
                New match announcements from organizers. Be the first to accept!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableBookings?.map((booking: any) => (
                <div key={booking.id} className={`border-l-4 ${booking.isPriority ? 'border-red-500 bg-red-500/10' : 'border-lime-400 bg-gray-800'} pl-4 py-3 rounded-r-lg shadow-sm`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {booking.isPriority && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-2">
                          🚨 PRIORITY — Goalkeeper needed urgently!
                        </Badge>
                      )}
                      <h4 className="font-semibold text-lg">
                        {booking?.organizer?.name}
                      </h4>
                      <Badge variant="outline" className={booking.isPriority ? 'text-red-400 border-red-500/30 mt-1' : 'text-lime-400 mt-1'}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {booking.isPriority ? 'Urgent — match is soon!' : 'First to accept gets it!'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.duration} hours
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.location}
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-3 w-3 mr-1" />
                      €{((booking.totalAmount * 0.75) / 100).toFixed(0)} earnings
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    <strong>Field Type:</strong> {booking.fieldType}
                  </div>
                  {booking.specialRequests && (
                    <div className="text-sm text-gray-400 mb-3 p-2 bg-gray-800 rounded">
                      <strong>Notes:</strong> {booking.specialRequests}
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    className="bg-lime-400 hover:bg-lime-300 text-gray-950 w-full"
                    onClick={() => handleAcceptBooking(booking.id)}
                    disabled={loadingBookingId === booking.id}
                  >
                    {loadingBookingId === booking.id ? (
                      'Accepting...'
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept This Match
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Confirm Your Attendance */}
          {needsGoalkeeperConfirmation?.length > 0 && (
            <Card className="border-green-300">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Confirm Your Attendance
                </CardTitle>
                <CardDescription>
                  Matches where you need to confirm you attended
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-4">
                {needsGoalkeeperConfirmation.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-green-500 pl-4 py-3 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">
                          Match with {booking?.organizer?.name || 'Organizer'}
                        </h4>
                        <p className="text-xs text-green-700 font-medium mt-1">
                          ⏰ Confirm within: {getTimeUntilDeadline(booking.confirmationDeadline)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-100">
                        Action Needed
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center text-green-700 font-medium">
                        <Euro className="h-3 w-3 mr-1" />
                        You will earn: €{((booking.totalAmount * 0.75) / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleGoalkeeperConfirm(booking.id)}
                        disabled={confirmingBookingId === booking.id}
                      >
                        {confirmingBookingId === booking.id ? (
                          'Confirming...'
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Yes, I Attended This Match
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="mt-2 p-2 bg-gray-900 rounded border border-green-700">
                      <p className="text-xs text-gray-400">
                        💡 <strong>Note:</strong> After you confirm, the organizer will validate and rate your performance to release payment.
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 text-orange-600 mr-2" />
                Pending Requests
              </CardTitle>
              <CardDescription>
                New booking requests awaiting your response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingBookings?.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No pending requests at the moment.
                </p>
              ) : (
                pendingBookings?.slice(0, 3)?.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        {booking?.organizer?.name}
                      </h4>
                      <Badge variant="outline" className="text-orange-600">
                        PENDING
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1" />
                        €{(booking.totalAmount / 100).toFixed(0)} ({booking.duration}h)
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-lime-400 hover:bg-lime-300 text-gray-950">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>


          {/* Awaiting Confirmation */}
          {awaitingConfirmation?.length > 0 && (
            <Card className="border-lime-400/20">
              <CardHeader className="bg-lime-400/5">
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 text-lime-400 mr-2" />
                  Awaiting Organizer Confirmation
                </CardTitle>
                <CardDescription>
                  Remind organizers to confirm your attendance to receive payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-4">
                {awaitingConfirmation.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-lime-400 pl-4 py-3 bg-lime-400/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {booking?.organizer?.name || 'Organizer'}
                        </h4>
                        <p className="text-xs text-lime-500 font-medium mt-1">
                          ⏰ Payment auto-releases in: {getTimeUntilDeadline(booking.confirmationDeadline)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-lime-400/10">
                        Awaiting
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center text-green-700 font-medium">
                        <Euro className="h-3 w-3 mr-1" />
                        You earn: €{((booking.totalAmount * 0.75) / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                      <p className="text-xs text-gray-400">
                        💡 <strong>Tip:</strong> Contact the organizer via phone/email to remind them to confirm your attendance in the app.
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 text-lime-400 mr-2" />
                Upcoming Matches
              </CardTitle>
              <CardDescription>
                Your confirmed matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings?.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No upcoming matches scheduled.
                </p>
              ) : (
                upcomingBookings?.slice(0, 3)?.map((booking: any) => (
                  <div key={booking.id} className={`border-l-4 ${booking.status === 'ACCEPTED' ? 'border-yellow-400' : 'border-lime-400'} pl-4 py-2`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        Match with {booking?.organizer?.name}
                      </h4>
                      {booking.status === 'ACCEPTED' ? (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                          AWAITING PAYMENT
                        </Badge>
                      ) : (
                        <Badge className="bg-lime-400 text-gray-950">
                          CONFIRMED
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.duration} hours
                      </div>
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1" />
                        €{((booking.totalAmount * 0.75) / 100).toFixed(0)} earnings
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-900/20"
                        onClick={() => handleOpenCancelDialog(booking)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel Match
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Referral Program */}
      <div className="mb-8">
        <ReferralCard />
      </div>

      {/* Cancellation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Cancel Match
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this match? Please note the cancellation policy below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {bookingToCancel && cancelFeeInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-lime-400/5 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-sm mb-2">Match Details:</h4>
                <p className="text-sm text-gray-300">
                  <strong>Organizer:</strong> {bookingToCancel.organizer?.name}
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Date:</strong> {new Date(bookingToCancel.date).toLocaleDateString()} at {new Date(bookingToCancel.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Location:</strong> {bookingToCancel.location}
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Time until match:</strong> {cancelFeeInfo.hoursUntilMatch} hours
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                cancelFeeInfo.warningLevel === 'NONE' 
                  ? 'bg-green-50 border-green-700' 
                  : cancelFeeInfo.warningLevel === 'LIGHT'
                  ? 'bg-yellow-50 border-yellow-700'
                  : cancelFeeInfo.warningLevel === 'MODERATE'
                  ? 'bg-orange-50 border-orange-700'
                  : 'bg-red-900/20 border-red-200'
              }`}>
                <h4 className="font-semibold text-sm mb-2">
                  {cancelFeeInfo.message}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between text-gray-400">
                    <span>You would have earned:</span>
                    <span className="font-medium">€{(cancelFeeInfo.goalkeeperEarnings / 100).toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between border-t pt-1 text-xs text-gray-400">
                    <span>Organizer receives full refund:</span>
                    <span>€{(bookingToCancel.totalAmount / 100).toFixed(2)}</span>
                  </p>
                  {cancelFeeInfo.warningLevel === 'NONE' && (
                    <p className="text-green-600 text-xs mt-2">
                      ✓ No warning or penalty
                    </p>
                  )}
                  {cancelFeeInfo.warningLevel !== 'NONE' && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      cancelFeeInfo.warningLevel === 'LIGHT' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
                      cancelFeeInfo.warningLevel === 'MODERATE' ? 'bg-orange-100 border border-orange-300 text-orange-800' :
                      'bg-red-100 border border-red-300 text-red-800'
                    }`}>
                      <strong>Warning System:</strong> 
                      {cancelFeeInfo.warningLevel === 'LIGHT' && ' You will receive 1 warning point.'}
                      {cancelFeeInfo.warningLevel === 'MODERATE' && ' You will receive 2 warning points.'}
                      {cancelFeeInfo.warningLevel === 'SEVERE' && ' You will receive 3 warning points.'}
                      {cancelFeeInfo.warningLevel === 'CRITICAL' && ' You will receive 3 warning points + 7-day account block!'}
                      <br/>
                      <span className="text-xs">Current warnings: {warningCount} | 9 warnings = permanent block</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cancelReason">Reason (Optional)</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep Match
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Match'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}