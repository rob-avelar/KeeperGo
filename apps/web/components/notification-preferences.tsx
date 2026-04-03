
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Loader2, Save, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationPreferences {
  emailNotifications: boolean
  notifyBookingAccepted: boolean
  notifyBookingCancelled: boolean
  notifyMatchReminder24h: boolean
  notifyMatchReminder2h: boolean
  notifyPaymentReceived: boolean
}

export default function NotificationPreferences() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    notifyBookingAccepted: true,
    notifyBookingCancelled: true,
    notifyMatchReminder24h: true,
    notifyMatchReminder2h: true,
    notifyPaymentReceived: true
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        toast({
          title: 'Preferences saved',
          description: 'Your notification preferences have been updated'
        })
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-lime-400" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which notifications you want to receive via email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between p-4 bg-lime-400/5 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-lime-400" />
            <div>
              <Label htmlFor="emailNotifications" className="text-base font-semibold cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-400">
                Enable or disable all email notifications
              </p>
            </div>
          </div>
          <Switch
            id="emailNotifications"
            checked={preferences.emailNotifications}
            onCheckedChange={() => togglePreference('emailNotifications')}
          />
        </div>

        {/* Individual preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label htmlFor="notifyBookingAccepted" className="cursor-pointer">
                Booking Accepted
              </Label>
              <p className="text-sm text-gray-400">
                When a goalkeeper accepts your match
              </p>
            </div>
            <Switch
              id="notifyBookingAccepted"
              checked={preferences.notifyBookingAccepted}
              onCheckedChange={() => togglePreference('notifyBookingAccepted')}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label htmlFor="notifyBookingCancelled" className="cursor-pointer">
                Booking Cancelled
              </Label>
              <p className="text-sm text-gray-400">
                When a match is cancelled by either party
              </p>
            </div>
            <Switch
              id="notifyBookingCancelled"
              checked={preferences.notifyBookingCancelled}
              onCheckedChange={() => togglePreference('notifyBookingCancelled')}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label htmlFor="notifyMatchReminder24h" className="cursor-pointer">
                24-Hour Reminder
              </Label>
              <p className="text-sm text-gray-400">
                Reminder 24 hours before the match
              </p>
            </div>
            <Switch
              id="notifyMatchReminder24h"
              checked={preferences.notifyMatchReminder24h}
              onCheckedChange={() => togglePreference('notifyMatchReminder24h')}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Label htmlFor="notifyMatchReminder2h" className="cursor-pointer">
                2-Hour Reminder
              </Label>
              <p className="text-sm text-gray-400">
                Reminder 2 hours before the match
              </p>
            </div>
            <Switch
              id="notifyMatchReminder2h"
              checked={preferences.notifyMatchReminder2h}
              onCheckedChange={() => togglePreference('notifyMatchReminder2h')}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="notifyPaymentReceived" className="cursor-pointer">
                Payment Received
              </Label>
              <p className="text-sm text-gray-400">
                When you receive a payment (goalkeeper only)
              </p>
            </div>
            <Switch
              id="notifyPaymentReceived"
              checked={preferences.notifyPaymentReceived}
              onCheckedChange={() => togglePreference('notifyPaymentReceived')}
              disabled={!preferences.emailNotifications}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={savePreferences}
            disabled={saving}
            className="bg-lime-400 hover:bg-lime-300 text-gray-950"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
