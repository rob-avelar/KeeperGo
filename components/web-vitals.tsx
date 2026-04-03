
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { isAnalyticsEnabled } from '@/lib/analytics'

export default function WebVitals() {
  useReportWebVitals((metric) => {
    if (!isAnalyticsEnabled()) {
      // In development, log to console
      console.log('Web Vital:', metric)
      return
    }

    // Send to Google Analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}
