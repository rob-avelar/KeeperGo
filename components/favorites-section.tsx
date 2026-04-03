
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Heart, MapPin, Euro, Loader2, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface FavoriteGoalkeeper {
  id: string
  goalkeeperId: string
  createdAt: string
  goalkeeper: {
    id: string
    name: string | null
    email: string
    image: string | null
    goalkeeperProfile: {
      id: string
      bio: string | null
      experienceLevel: string | null
      averageRating: number
      totalMatches: number
      city: string | null
      profilePhotoPath: string | null
    } | null
  }
}

export default function FavoritesSection() {
  const { toast } = useToast()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteGoalkeeper[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (goalkeeperId: string) => {
    setRemoving(goalkeeperId)
    try {
      const response = await fetch(`/api/favorites?goalkeeperId=${goalkeeperId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(f => f.goalkeeperId !== goalkeeperId))
        toast({
          title: 'Removed from favorites',
          description: 'Goalkeeper removed from your favorites list',
        })
      } else {
        throw new Error('Failed to remove favorite')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove goalkeeper from favorites',
        variant: 'destructive',
      })
    } finally {
      setRemoving(null)
    }
  }

  const inviteGoalkeeper = (goalkeeperId: string) => {
    router.push(`/organizer/book-goalkeeper?invite=${goalkeeperId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-lime-400" />
            Favorite Goalkeepers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-lime-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-lime-400" />
            Favorite Goalkeepers
          </CardTitle>
          <CardDescription>
            Your favorite goalkeepers will appear here for quick access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No favorite goalkeepers yet</p>
            <p className="text-sm mt-1">Add goalkeepers to favorites for quick invites</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-lime-400 fill-lime-400" />
          Favorite Goalkeepers
          <Badge variant="secondary" className="ml-auto">{favorites.length}</Badge>
        </CardTitle>
        <CardDescription>
          Quick access to your trusted goalkeepers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const profile = favorite.goalkeeper.goalkeeperProfile
            const displayName = favorite.goalkeeper.name || favorite.goalkeeper.email.split('@')[0]
            
            return (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {profile?.profilePhotoPath ? (
                        <Image
                          src={profile.profilePhotoPath}
                          alt={displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-lime-400/10 text-lime-400 font-semibold text-lg">
                          {displayName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{displayName}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {profile?.averageRating && profile.averageRating > 0 ? (
                          <>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{profile.averageRating.toFixed(1)}</span>
                            <span className="text-xs">({profile.totalMatches} matches)</span>
                          </>
                        ) : (
                          <span className="text-xs">New goalkeeper</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {profile?.city && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{profile.city}</span>
                    </div>
                  )}

                  {profile?.experienceLevel && (
                    <Badge variant="outline" className="mb-3">
                      {profile.experienceLevel}
                    </Badge>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-lime-400 hover:bg-lime-300 text-gray-950"
                      onClick={() => inviteGoalkeeper(favorite.goalkeeperId)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Invite
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFavorite(favorite.goalkeeperId)}
                      disabled={removing === favorite.goalkeeperId}
                    >
                      {removing === favorite.goalkeeperId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Heart className="h-3 w-3 fill-lime-400 text-lime-400" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
