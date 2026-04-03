'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Users,
  Search,
  Shield,
  ArrowLeft,
  Star,
  Calendar,
  Mail,
  Ban,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  image: string | null
  goalkeeperProfile: {
    averageRating: number | null
    totalMatches: number
    city: string | null
    isBlocked: boolean
  } | null
  _count: {
    organizerBookings: number
    goalkeeperBookings: number
  }
}

interface UserDetail {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  goalkeeperProfile: any
  organizerBookings: any[]
  goalkeeperBookings: any[]
  ratingsReceived: any[]
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Detail dialog
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  // Block dialog
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [userToBlock, setUserToBlock] = useState<User | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        role: roleFilter,
      })
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const fetchUserDetail = async (userId: string) => {
    try {
      setDetailLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data)
        setDetailOpen(true)
      }
    } catch (error) {
      console.error('Error fetching user detail:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleBlockUser = async () => {
    if (!userToBlock) return

    setBlocking(true)
    try {
      const response = await fetch(`/api/admin/users/${userToBlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: userToBlock.goalkeeperProfile?.isBlocked ? 'unblock' : 'block',
          reason: blockReason,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: userToBlock.goalkeeperProfile?.isBlocked
            ? 'User has been unblocked'
            : 'User has been blocked',
        })
        fetchUsers()
      } else {
        throw new Error('Failed to update user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      })
    } finally {
      setBlocking(false)
      setBlockDialogOpen(false)
      setUserToBlock(null)
      setBlockReason('')
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
                <h1 className="text-xl font-bold text-white">User Management</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="ORGANIZER">Organizers</SelectItem>
                  <SelectItem value="GOALKEEPER">Goalkeepers</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4 text-slate-400">
          Showing {users.length} of {total} users
        </div>

        {/* Users List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <Users className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{user.name || 'Unnamed'}</p>
                            <Badge
                              variant={user.role === 'ORGANIZER' ? 'default' : 'secondary'}
                              className={user.role === 'ORGANIZER' ? 'bg-lime-400/20 text-lime-400' : 'bg-lime-400/20 text-lime-300'}
                            >
                              {user.role}
                            </Badge>
                            {user.goalkeeperProfile?.isBlocked && (
                              <Badge variant="destructive">Blocked</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {user.role === 'GOALKEEPER' && user.goalkeeperProfile && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="h-4 w-4 fill-yellow-500" />
                              <span className="font-medium">
                                {user.goalkeeperProfile.averageRating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {user.goalkeeperProfile.totalMatches} matches
                            </p>
                          </div>
                        )}
                        {user.role === 'ORGANIZER' && (
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {user._count.organizerBookings}
                            </p>
                            <p className="text-xs text-slate-400">bookings</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                            onClick={() => fetchUserDetail(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.role === 'GOALKEEPER' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={user.goalkeeperProfile?.isBlocked ? 'text-emerald-500 hover:text-emerald-400' : 'text-red-500 hover:text-red-400'}
                              onClick={() => {
                                setUserToBlock(user)
                                setBlockDialogOpen(true)
                              }}
                            >
                              {user.goalkeeperProfile?.isBlocked ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
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

      {/* User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Name</Label>
                  <p className="text-white">{selectedUser.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Email</Label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Role</Label>
                  <Badge className={selectedUser.role === 'ORGANIZER' ? 'bg-lime-400/20 text-lime-400' : 'bg-lime-400/20 text-lime-300'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400">Joined</Label>
                  <p className="text-white">{format(new Date(selectedUser.createdAt), 'PPP')}</p>
                </div>
              </div>

              {selectedUser.goalkeeperProfile && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-emerald-500">Goalkeeper Profile</h4>
                  <div className="grid grid-cols-2 gap-4 bg-slate-700/50 rounded-lg p-4">
                    <div>
                      <Label className="text-slate-400">Rating</Label>
                      <p className="text-yellow-500 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        {selectedUser.goalkeeperProfile.averageRating?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Total Matches</Label>
                      <p className="text-white">{selectedUser.goalkeeperProfile.totalMatches || 0}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">City</Label>
                      <p className="text-white">{selectedUser.goalkeeperProfile.city || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Status</Label>
                      {selectedUser.goalkeeperProfile.isBlocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.organizerBookings?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-lime-400">Recent Bookings (as Organizer)</h4>
                  <div className="space-y-2">
                    {selectedUser.organizerBookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="bg-slate-700/50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                          <span>{booking.location}</span>
                          <Badge variant={booking.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-slate-400">{format(new Date(booking.date), 'PPP')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.ratingsReceived?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-yellow-500">Recent Ratings</h4>
                  <div className="space-y-2">
                    {selectedUser.ratingsReceived.map((rating: any) => (
                      <div key={rating.id} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white">{rating.rater?.name || 'Anonymous'}</span>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-yellow-500" />
                            {rating.score}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-slate-400 text-sm mt-1">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {userToBlock?.goalkeeperProfile?.isBlocked ? 'Unblock User' : 'Block User'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {userToBlock?.goalkeeperProfile?.isBlocked
                ? 'This will allow the user to accept bookings again.'
                : 'This will prevent the user from accepting any new bookings.'}
            </DialogDescription>
          </DialogHeader>
          {!userToBlock?.goalkeeperProfile?.isBlocked && (
            <div>
              <Label>Reason for blocking (optional)</Label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason..."
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockDialogOpen(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlockUser}
              disabled={blocking}
              className={userToBlock?.goalkeeperProfile?.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {blocking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {userToBlock?.goalkeeperProfile?.isBlocked ? 'Unblock' : 'Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
