'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Calendar,
  Euro,
  TrendingUp,
  Goal,
  Settings,
  UserCheck,
  UserX,
  Clock,
  Star,
  Shield,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface AdminStats {
  users: {
    total: number
    organizers: number
    goalkeepers: number
    newToday: number
    newThisWeek: number
    newThisMonth: number
  }
  bookings: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
  revenue: {
    totalTransactions: number
    platformRevenue: number
  }
  registrationTrend: Array<{ date: string; count: number }>
  topGoalkeepers: Array<{
    name: string
    email: string
    rating: number
    totalMatches: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg shadow-black/20 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl font-bold text-white">KeeperGo Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="flex items-center cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/bookings" className="flex items-center cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/beta" className="flex items-center cursor-pointer">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Beta Testers
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-slate-400">
            Monitor platform activity and manage users effectively.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/users">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/bookings">
              <Button variant="outline" className="border-emerald-600 text-emerald-500 hover:bg-emerald-600/10">
                <Calendar className="w-4 h-4 mr-2" />
                View Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-white">{stats?.users.total || 0}</span>
                  <p className="text-xs text-emerald-500 mt-1">+{stats?.users.newToday || 0} today</p>
                </div>
                <Users className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Organizers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{stats?.users.organizers || 0}</span>
                <UserCheck className="h-8 w-8 text-lime-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Goalkeepers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{stats?.users.goalkeepers || 0}</span>
                <Goal className="h-8 w-8 text-lime-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Platform Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">€{stats?.revenue.platformRevenue?.toFixed(0) || 0}</span>
                <Euro className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Booking Statistics
              </CardTitle>
              <CardDescription className="text-slate-400">
                Overview of all bookings on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats?.bookings.total || 0}</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-4">
                  <p className="text-yellow-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats?.bookings.pending || 0}</p>
                </div>
                <div className="bg-lime-400/50/10 rounded-lg p-4">
                  <p className="text-lime-400 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-lime-400">{stats?.bookings.confirmed || 0}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-4">
                  <p className="text-emerald-500 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats?.bookings.completed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                New Registrations (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.registrationTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en', { weekday: 'short' })}
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Goalkeepers */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Rated Goalkeepers
            </CardTitle>
            <CardDescription className="text-slate-400">
              Best performing goalkeepers on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topGoalkeepers?.length === 0 && (
                <p className="text-slate-400 text-center py-4">No rated goalkeepers yet</p>
              )}
              {stats?.topGoalkeepers?.map((gk, index) => (
                <div
                  key={gk.email}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-500 font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{gk.name || 'Unnamed'}</p>
                      <p className="text-slate-400 text-sm">{gk.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Rating</p>
                      <p className="text-yellow-500 font-bold flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                        {gk.rating?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Matches</p>
                      <p className="text-white font-bold">{gk.totalMatches || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
