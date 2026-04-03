
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { User, MapPin, Euro, Upload, Goal, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface GoalkeeperProfileFormProps {
  user: any
}

export default function GoalkeeperProfileForm({ user }: GoalkeeperProfileFormProps) {
  const profile = user?.goalkeeperProfile
  const [formData, setFormData] = useState({
    age: profile?.age || '',
    bio: profile?.bio || '',
    experienceLevel: profile?.experienceLevel || '',
    preferredFields: profile?.preferredFields || [],
    serviceRadius: profile?.serviceRadius || 10,
    hourlyRateMin: profile?.hourlyRateMin ? profile.hourlyRateMin / 100 : 20,
    hourlyRateMax: profile?.hourlyRateMax ? profile.hourlyRateMax / 100 : 30,
    address: profile?.address || '',
    city: profile?.city || '',
    postalCode: profile?.postalCode || ''
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fieldTypes = ['5-a-side', '7-a-side', '11-a-side', 'Indoor', 'Outdoor']
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'preferredFields') {
          (value as string[]).forEach(field => {
            formDataToSend.append('preferredFields[]', field)
          })
        } else {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add photo if selected
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto)
      }

      const response = await fetch('/api/goalkeeper-profile', {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast({
        title: 'Success!',
        description: 'Your profile has been updated successfully.',
      })

      router.push('/goalkeeper/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFieldTypeChange = (fieldType: string, checked: boolean) => {
    const currentFields = formData.preferredFields as string[]
    if (checked) {
      handleChange('preferredFields', [...currentFields, fieldType])
    } else {
      handleChange('preferredFields', currentFields.filter(f => f !== fieldType))
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/goalkeeper/dashboard" className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </Link>
            <Link href="/goalkeeper/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Your Profile</h2>
          <p className="text-gray-400">
            Complete your profile to receive more booking requests from organizers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg shadow-black/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 text-lime-400 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell organizers about yourself and your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {profile?.profilePhotoPath ? (
                      <img 
                        src="/placeholder-avatar.jpg" 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover" 
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                      className="max-w-xs"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Upload a professional photo to increase bookings
                    </p>
                  </div>
                </div>
              </div>

              {/* Age and Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="65"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    placeholder="e.g., 28"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell organizers about your goalkeeping experience, playing style, and what makes you a great goalkeeper..."
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-lg shadow-black/20">
            <CardHeader>
              <CardTitle>Field Preferences</CardTitle>
              <CardDescription>
                Select the types of fields you prefer to play on
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Preferred Field Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {fieldTypes.map(fieldType => (
                    <div key={fieldType} className="flex items-center space-x-2">
                      <Checkbox
                        id={fieldType}
                        checked={formData.preferredFields.includes(fieldType)}
                        onCheckedChange={(checked) => handleFieldTypeChange(fieldType, checked as boolean)}
                      />
                      <Label htmlFor={fieldType} className="text-sm">
                        {fieldType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rates and Service Area */}
          <Card className="shadow-lg shadow-black/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="h-5 w-5 text-lime-400 mr-2" />
                Rates & Service Area
              </CardTitle>
              <CardDescription>
                Set your hourly rates and service radius
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRateMin">Minimum Rate (€/hour)</Label>
                  <Input
                    id="hourlyRateMin"
                    type="number"
                    min="20"
                    max="100"
                    value={formData.hourlyRateMin}
                    onChange={(e) => handleChange('hourlyRateMin', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRateMax">Maximum Rate (€/hour)</Label>
                  <Input
                    id="hourlyRateMax"
                    type="number"
                    min="20"
                    max="100"
                    value={formData.hourlyRateMax}
                    onChange={(e) => handleChange('hourlyRateMax', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                <Input
                  id="serviceRadius"
                  type="number"
                  min="5"
                  max="50"
                  value={formData.serviceRadius}
                  onChange={(e) => handleChange('serviceRadius', parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-400">
                  Maximum distance you're willing to travel for matches
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="shadow-lg shadow-black/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 text-lime-400 mr-2" />
                Location
              </CardTitle>
              <CardDescription>
                Your base location for calculating distances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g., Amsterdam"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="e.g., 1012"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g., Centrum, Amsterdam"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/goalkeeper/dashboard">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-lime-400 hover:bg-lime-300 text-gray-950"
              disabled={isLoading}
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  Save Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
