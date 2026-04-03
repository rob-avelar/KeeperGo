
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Euro, 
  Heart,
  Loader2,
  Mail,
  Trophy,
  Goal
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Goalkeeper {
  id: string
  userId: string
  bio: string | null
  experienceLevel: string | null
  averageRating: number
  totalMatches: number
  city: string | null
  profilePhotoPath: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function SearchGoalkeepersClient() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minRating: 0,
    experienceLevel: 'all',
    maxDistance: 50,
    fieldType: 'all'
  })
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)

  useEffect(() => {
    fetchGoalkeepers()
    fetchFavorites()
  }, [])

  useEffect(() => {
    fetchGoalkeepers()
  }, [filters])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        const favoriteIds = new Set<string>(data.map((f: any) => f.goalkeeperId))
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const fetchGoalkeepers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.minRating > 0) {
        params.append('minRating', filters.minRating.toString())
      }
      if (filters.experienceLevel !== 'all') {
        params.append('experienceLevel', filters.experienceLevel)
      }
      if (filters.fieldType !== 'all') {
        params.append('fieldType', filters.fieldType)
      }
      params.append('radius', filters.maxDistance.toString())

      const response = await fetch(`/api/goalkeepers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setGoalkeepers(data)
      }
    } catch (error) {
      console.error('Error fetching goalkeepers:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch goalkeepers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (goalkeeperId: string) => {
    setTogglingFavorite(goalkeeperId)
    try {
      const isFavorite = favorites.has(goalkeeperId)
      
      if (isFavorite) {
        const response = await fetch(`/api/favorites?goalkeeperId=${goalkeeperId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setFavorites(prev => {
            const newSet = new Set(prev)
            newSet.delete(goalkeeperId)
            return newSet
          })
          toast({
            title: 'Removed from favorites',
            description: 'Goalkeeper removed from your favorites'
          })
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalkeeperId })
        })
        
        if (response.ok) {
          setFavorites(prev => new Set(prev).add(goalkeeperId))
          toast({
            title: 'Added to favorites',
            description: 'Goalkeeper added to your favorites'
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive'
      })
    } finally {
      setTogglingFavorite(null)
    }
  }

  const inviteGoalkeeper = (goalkeeperId: string) => {
    router.push(`/organizer/book-goalkeeper?invite=${goalkeeperId}`)
  }

  const resetFilters = () => {
    setFilters({
      minRating: 0,
      experienceLevel: 'all',
      maxDistance: 50,
      fieldType: 'all'
    })
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </Link>
            <Link href="/organizer/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Find Goalkeepers
          </h2>
          <p className="text-gray-400">
            Search and filter to find the perfect goalkeeper for your match
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Refine your search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Minimum Rating */}
                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">
                      {filters.minRating === 0 ? 'Any' : `${filters.minRating.toFixed(1)}+`}
                    </span>
                  </div>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Type */}
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={filters.fieldType}
                    onValueChange={(value) => setFilters({ ...filters, fieldType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="Artificial">Artificial Turf</SelectItem>
                      <SelectItem value="Grass">Natural Grass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Distance */}
                <div className="space-y-2">
                  <Label>Maximum Distance</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-lime-400" />
                    <span className="font-semibold">{filters.maxDistance} km</span>
                  </div>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={(value) => setFilters({ ...filters, maxDistance: value[0] })}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
              </div>
            ) : goalkeepers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No goalkeepers found</h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-400">
                  Found {goalkeepers.length} goalkeeper{goalkeepers.length !== 1 ? 's' : ''}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {goalkeepers.map((gk) => {
                    const displayName = gk.user.name || gk.user.email.split('@')[0]
                    const isFavorite = favorites.has(gk.user.id)
                    
                    return (
                      <Card key={gk.id} className="overflow-hidden hover:shadow-lg shadow-black/20 transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {gk.profilePhotoPath ? (
                                <Image
                                  src={gk.profilePhotoPath}
                                  alt={displayName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-lime-400/10 text-lime-400 font-semibold text-2xl">
                                  {displayName[0]?.toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-lg truncate">{displayName}</h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleFavorite(gk.user.id)}
                                  disabled={togglingFavorite === gk.user.id}
                                  className="ml-2 flex-shrink-0"
                                >
                                  {togglingFavorite === gk.user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Heart 
                                      className={`h-4 w-4 ${isFavorite ? 'fill-lime-400 text-lime-400' : 'text-gray-400'}`} 
                                    />
                                  )}
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                {gk.averageRating > 0 ? (
                                  <>
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{gk.averageRating.toFixed(1)}</span>
                                    <span className="text-xs">({gk.totalMatches} matches)</span>
                                  </>
                                ) : (
                                  <span className="text-xs">New goalkeeper</span>
                                )}
                              </div>

                              {gk.city && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{gk.city}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {gk.experienceLevel && (
                            <Badge variant="outline" className="mb-3">
                              <Trophy className="h-3 w-3 mr-1" />
                              {gk.experienceLevel}
                            </Badge>
                          )}

                          {gk.bio && (
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                              {gk.bio}
                            </p>
                          )}

                          <Button
                            className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950"
                            onClick={() => inviteGoalkeeper(gk.user.id)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Invite to Match
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
