
'use client'

import { useState } from 'react'
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
  Plus,
  Star,
  Users,
  Activity,
  TrendingUp,
  Goal,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  User,
  Bell,
  ArrowLeftRight,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { ConfirmBookingModal } from './confirm-booking-modal'
import FavoritesSection from './favorites-section'

interface OrganizerDashboardProps {
  user: any
}

export default function OrganizerDashboard({ user }: OrganizerDashboardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const bookings = user?.organizerBookings || []
  
  // Cancellation state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelFeeInfo, setCancelFeeInfo] = useState<any>(null)

  // Confirmation state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [bookingToConfirm, setBookingToConfirm] = useState<any>(null)
  
  // No-show state
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false)
  const [bookingToReport, setBookingToReport] = useState<any>(null)
  const [reportingNoShow, setReportingNoShow] = useState(false)

  const now = new Date()

  // Upcoming bookings (future matches)
  const upcomingBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= now && (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED')
  ) || []

  // Bookings awaiting confirmation (past matches, within 48h deadline)
  const awaitingConfirmation = bookings?.filter((booking: any) => {
    const matchDate = new Date(booking.date)
    const matchEndTime = new Date(matchDate)
    matchEndTime.setHours(matchEndTime.getHours() + (booking.duration || 0))
    
    return (
      matchEndTime < now && // Match has ended
      booking.status === 'CONFIRMED' &&
      !booking.confirmedAt &&
      !booking.noShow &&
      booking.confirmationDeadline &&
      new Date(booking.confirmationDeadline) > now // Still within deadline
    )
  }) || []

  const openBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= now && booking.status === 'PENDING' && !booking.goalkeeperId
  ) || []

  const completedBookings = bookings?.filter((booking: any) => 
    booking.isCompleted || booking.status === 'COMPLETED'
  ) || []

  // Calculate success rate: completed matches without cancellations or no-shows
  const pastBookings = bookings?.filter((booking: any) => {
    const matchDate = new Date(booking.date)
    const matchEndTime = new Date(matchDate)
    matchEndTime.setHours(matchEndTime.getHours() + (booking.duration || 0))
    return matchEndTime < now
  }) || []

  const successfulMatches = pastBookings?.filter((booking: any) => 
    (booking.isCompleted || booking.status === 'COMPLETED') && !booking.noShow
  ) || []

  const successRate = pastBookings.length > 0 
    ? Math.round((successfulMatches.length / pastBookings.length) * 100)
    : 100 // Show 100% if no matches yet (optimistic default)

  const averageRating = completedBookings?.length > 0 
    ? completedBookings?.reduce((sum: number, booking: any) => {
        const bookingRatings = booking.ratings?.filter((r: any) => r.raterId === user.id) || []
        return sum + (bookingRatings[0]?.overallRating || 0)
      }, 0) / completedBookings.length
    : 0

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

  const calculateCancellationPreview = (booking: any) => {
    const now = new Date()
    const matchDate = new Date(booking.date)
    const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercentage = 0
    let message = ''

    if (hoursUntilMatch > 6) {
      refundPercentage = 100
      message = 'Free cancellation - Full refund'
    } else if (hoursUntilMatch > 3) {
      refundPercentage = 50
      message = '50% refund (3-6h before match)'
    } else if (hoursUntilMatch > 1) {
      refundPercentage = 25
      message = '25% refund (1-3h before match)'
    } else {
      refundPercentage = 0
      message = 'No refund (<1h before match)'
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100)
    const cancellationFee = booking.totalAmount - refundAmount

    return {
      refundAmount,
      cancellationFee,
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
          reason: cancelReason || 'Cancelled by organizer'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Booking Cancelled',
          description: data.message || 'Booking has been cancelled successfully',
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

  const handleReportNoShow = async () => {
    if (!bookingToReport) return

    setReportingNoShow(true)
    try {
      const response = await fetch(`/api/bookings/${bookingToReport.id}/report-noshow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Goalkeeper did not show up'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'No-Show Reported',
          description: 'Goalkeeper has been blocked and full refund issued.',
        })
        
        setNoShowDialogOpen(false)
        setBookingToReport(null)
        
        // Refresh page to show updated data
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to report no-show',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error reporting no-show:', error)
      toast({
        title: 'Error',
        description: 'Failed to report no-show',
        variant: 'destructive'
      })
    } finally {
      setReportingNoShow(false)
    }
  }

  const getTimeUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursLeft < 0) return 'Deadline passed'
    if (hoursLeft < 1) return 'Less than 1 hour left'
    if (hoursLeft < 24) return `${hoursLeft}h left`
    return `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`
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
                      body: JSON.stringify({ targetRole: 'GOALKEEPER' }),
                    })
                    if (!res.ok) {
                      const data = await res.json()
                      toast({ title: 'Error', description: data.error || 'Could not switch role', variant: 'destructive' })
                      return
                    }
                    router.push('/goalkeeper/dashboard')
                  } catch {
                    toast({ title: 'Error', description: 'Could not switch role', variant: 'destructive' })
                  }
                }}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1.5" />
                Goalkeeper Mode
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/organizer/account" className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/organizer/analytics" className="flex items-center cursor-pointer">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
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
            Manage your matches and find the perfect goalkeepers for your games.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/organizer/book-goalkeeper">
              <Button className="bg-lime-400 hover:bg-lime-300 text-gray-950">
                <Plus className="w-4 h-4 mr-2" />
                Post Match Announcement
              </Button>
            </Link>
            <Link href="/organizer/search-goalkeepers">
              <Button variant="outline" className="border-lime-400 text-lime-400 hover:bg-lime-400/5">
                <Users className="w-4 h-4 mr-2" />
                Search Goalkeepers
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
                <span className="text-2xl font-bold">{bookings?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-lime-400 mr-2" />
                <span className="text-2xl font-bold">{upcomingBookings?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className={`h-4 w-4 mr-2 ${successRate >= 80 ? 'text-green-600' : successRate >= 60 ? 'text-yellow-600' : 'text-orange-600'}`} />
                <span className="text-2xl font-bold">{successRate}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {successfulMatches.length} of {pastBookings.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Avg. Rating Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Goalkeepers */}
        <div className="mb-8">
          <FavoritesSection />
        </div>

        {/* Open Announcements */}
        {openBookings?.length > 0 && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Activity className="h-5 w-5 mr-2" />
                Open Match Announcements
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Waiting for goalkeepers to accept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openBookings?.map((booking: any) => (
                <div key={booking.id} className={`border-l-4 ${booking.isPriority ? 'border-red-500 bg-red-500/10' : 'border-yellow-500 bg-gray-900'} pl-4 py-2 rounded-r-lg`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {booking.isPriority && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-1 text-xs">
                          🚨 PRIORITY
                        </Badge>
                      )}
                      <h4 className="font-semibold">
                        {booking.isPriority ? 'Goalkeeper left — searching new one' : 'Waiting for Goalkeeper'}
                      </h4>
                    </div>
                    <Badge variant="outline" className={booking.isPriority ? 'text-red-400 border-red-500/30' : 'text-yellow-600'}>
                      {booking.isPriority ? 'URGENT' : 'OPEN'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.duration} hours • {booking.fieldType}
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-3 w-3 mr-1" />
                      €{(booking.totalAmount / 100).toFixed(0)} total
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  No upcoming matches. Book a goalkeeper to get started!
                </p>
              ) : (
                upcomingBookings?.slice(0, 3)?.map((booking: any) => (
                  <div key={booking.id} className={`border-l-4 ${booking.status === 'ACCEPTED' ? 'border-yellow-400' : 'border-lime-400'} pl-4 py-2`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        {booking?.goalkeeper?.name || 'Goalkeeper TBD'}
                      </h4>
                      <Badge
                        variant="outline"
                        className={booking.status === 'ACCEPTED' ? 'text-yellow-400 border-yellow-400/50' : ''}
                      >
                        {booking.status === 'ACCEPTED' ? 'AWAITING PAYMENT' : booking.status}
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
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.duration} hours
                      </div>
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1" />
                        €{(booking.totalAmount / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {booking.status === 'ACCEPTED' && (
                        <Button
                          size="sm"
                          className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold"
                          onClick={() => router.push(`/organizer/pay/${booking.id}`)}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay Now — €{(booking.totalAmount / 100).toFixed(2)}
                        </Button>
                      )}
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

        {/* Bookings Awaiting Confirmation */}
        {awaitingConfirmation?.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                Awaiting Confirmation
              </CardTitle>
              <CardDescription>
                These matches have ended. Please confirm goalkeeper attendance within 48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {awaitingConfirmation.map((booking: any) => (
                <div key={booking.id} className={`border-l-4 pl-4 py-3 ${
                  booking.goalkeeperConfirmedAt 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-orange-500 bg-orange-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">
                        {booking?.goalkeeper?.name || 'Goalkeeper'}
                      </h4>
                      {booking.goalkeeperConfirmedAt ? (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-green-700 font-medium">
                            Goalkeeper confirmed attendance
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-orange-700 font-medium mt-1">
                          ⏰ Goalkeeper hasn't confirmed yet
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Deadline: {getTimeUntilDeadline(booking.confirmationDeadline)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={booking.goalkeeperConfirmedAt ? 'bg-green-100' : 'bg-orange-100'}
                    >
                      {booking.goalkeeperConfirmedAt ? 'Ready to Confirm' : 'Awaiting'}
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
                    <div className="flex items-center">
                      <Euro className="h-3 w-3 mr-1" />
                      €{(booking.totalAmount / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setBookingToConfirm(booking)
                        setConfirmModalOpen(true)
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirm & Rate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-900/20"
                      onClick={() => {
                        setBookingToReport(booking)
                        setNoShowDialogOpen(true)
                      }}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Report No-Show
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 text-lime-400 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest bookings and matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookings?.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No activity yet. Start by booking your first goalkeeper!
                </p>
              ) : (
                bookings?.slice(0, 5)?.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-lime-400 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        Match {booking.isCompleted ? 'Completed' : 'Scheduled'}
                      </h4>
                      <Badge 
                        variant={booking.status === 'COMPLETED' ? 'default' : 'outline'}
                      >
                        {booking.status}
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
                      {booking.isCompleted && (
                        <div className="flex items-center">
                          <Euro className="h-3 w-3 mr-1" />
                          €{(booking.totalAmount / 100).toFixed(0)}
                        </div>
                      )}
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
              Are you sure you want to cancel this match?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {bookingToCancel && cancelFeeInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-lime-400/5 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-sm mb-2">Match Details:</h4>
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
                cancelFeeInfo.cancellationFee === 0 
                  ? 'bg-green-50 border-green-700' 
                  : 'bg-orange-50 border-orange-700'
              }`}>
                <h4 className="font-semibold text-sm mb-2">
                  {cancelFeeInfo.message}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span>Original amount:</span>
                    <span className="font-medium">€{(bookingToCancel.totalAmount / 100).toFixed(2)}</span>
                  </p>
                  {cancelFeeInfo.cancellationFee > 0 && (
                    <p className="flex justify-between text-orange-600">
                      <span>Cancellation fee:</span>
                      <span className="font-medium">-€{(cancelFeeInfo.cancellationFee / 100).toFixed(2)}</span>
                    </p>
                  )}
                  <p className="flex justify-between border-t pt-1 font-semibold">
                    <span>You will receive:</span>
                    <span className="text-green-600">€{(cancelFeeInfo.refundAmount / 100).toFixed(2)}</span>
                  </p>
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

      {/* Confirm Booking Modal */}
      <ConfirmBookingModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false)
          setBookingToConfirm(null)
        }}
        bookingId={bookingToConfirm?.id || ''}
        goalkeeperName={bookingToConfirm?.goalkeeper?.name}
      />

      {/* Report No-Show Dialog */}
      <AlertDialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Report Goalkeeper No-Show
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure the goalkeeper did not show up for this match? This action will:
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>• Issue you a <strong>full refund</strong></li>
                <li>• <strong>Block</strong> the goalkeeper's account permanently</li>
                <li>• Cannot be undone</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {bookingToReport && (
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-200">
              <h4 className="font-semibold text-sm mb-2">Match Details:</h4>
              <p className="text-sm text-gray-300">
                <strong>Goalkeeper:</strong> {bookingToReport?.goalkeeper?.name}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Date:</strong> {new Date(bookingToReport.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Amount:</strong> €{(bookingToReport.totalAmount / 100).toFixed(2)}
              </p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reportingNoShow}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportNoShow}
              disabled={reportingNoShow}
              className="bg-red-600 hover:bg-red-700"
            >
              {reportingNoShow ? 'Reporting...' : 'Report No-Show'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </AlertDialog>
    </div>
  )
}