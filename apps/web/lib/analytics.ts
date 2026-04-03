
// Google Analytics configuration and utilities

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-PLACEHOLDER123'

export function isAnalyticsEnabled(): boolean {
  // Only enable analytics in production and when a valid ID is configured
  return (
    process.env.NODE_ENV === 'production' && 
    GA_MEASUREMENT_ID !== 'G-PLACEHOLDER123' &&
    !!GA_MEASUREMENT_ID
  )
}

// Track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'consent',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}
