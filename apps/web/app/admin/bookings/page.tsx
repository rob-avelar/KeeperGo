'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Shield,
  ArrowLeft,
  MapPin,
  Clock,
  Euro,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Booking {
  id: string
  date: string
  location: string
  duration: number
  totalAmount: number
  status: string
  bookingType: string
  createdAt: string
  organizer: { id: string; name: string | null; email: string }
  goalkeeper: { id: string; name: string | null; email: string } | null
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchBookings()
  }, [page, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'ACCEPTED':
        return 'bg-lime-400/20 text-blue-400'
      case 'CONFIRMED':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400'
      case 'CANCELLED':
        return 'bg-red-900/200/20 text-red-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg shadow-black/20 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-500" />
                <h1 className="text-xl font-bold text-white">Booking Management</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4 text-slate-400">
          Showing {bookings.length} of {total} bookings
        </div>

        {/* Bookings List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No bookings found
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {booking.bookingType === 'direct' ? 'Direct' : 'Open'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(booking.date), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.duration}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            €{(booking.totalAmount / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-slate-500">Organizer: </span>
                            <span className="text-blue-400">
                              {booking.organizer.name || booking.organizer.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Goalkeeper: </span>
                            <span className="text-lime-300">
                              {booking.goalkeeper
                                ? booking.goalkeeper.name || booking.goalkeeper.email
                                : 'Not assigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        Created {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-slate-600 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="border-slate-600 text-slate-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
