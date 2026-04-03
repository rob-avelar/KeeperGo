'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cookie, X } from 'lucide-react'

type CookieConsent = 'accepted' | 'declined' | null

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsent>('accepted') // Default to hide banner during SSR
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('cookie-consent')
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored)
    } else {
      setConsent(null)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    document.cookie = 'cookie-consent=accepted;path=/;max-age=31536000;SameSite=Lax'
    setConsent('accepted')
    // Enable GA if it was blocked
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    document.cookie = 'cookie-consent=declined;path=/;max-age=31536000;SameSite=Lax'
    setConsent('declined')
    // Disable GA
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      })
    }
  }

  // Don't show banner if consent already given or not mounted yet
  if (!mounted || consent !== null) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex flex-shrink-0 w-10 h-10 bg-lime-400/10 rounded-lg items-center justify-center">
            <Cookie className="h-5 w-5 text-lime-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">Cookie Preferences</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We use essential cookies to keep the platform running and analytics cookies (Google Analytics) 
              to improve our services. You can accept all cookies or decline non-essential ones.{' '}
              <Link href="/cookies" className="text-lime-400 hover:text-lime-300 underline">
                Learn more
              </Link>
            </p>
          </div>
          <button onClick={handleDecline} className="sm:hidden flex-shrink-0 text-gray-500 hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:ml-14">
          <Button
            onClick={handleAccept}
            size="sm"
            className="bg-lime-400 text-gray-950 hover:bg-lime-300 font-semibold"
          >
            Accept All
          </Button>
          <Button
            onClick={handleDecline}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  )
}
