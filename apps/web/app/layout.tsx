
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/session-provider'
import { auth } from '@/lib/auth'
import GoogleAnalytics from '@/components/google-analytics'
import WebVitals from '@/components/web-vitals'
import { CookieConsentBanner } from '@/components/cookie-consent'

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://keepergo.nl'),
  title: {
    default: 'KeeperGo - Hire a Goalkeeper for Your Match | Netherlands',
    template: '%s | KeeperGo',
  },
  description: 'Hire a goalkeeper for your amateur football match in the Netherlands. KeeperGo connects match organizers with available goalkeepers in Amsterdam, Rotterdam, Utrecht, and The Hague. Book instantly, pay securely.',
  keywords: 'goalkeeper hire, keeper huren, doelman huren, goalkeeper rental, football Netherlands, amateur football, zaalvoetbal, goalkeeper booking, Amsterdam, Rotterdam, Utrecht, Den Haag, keeper zoeken',
  authors: [{ name: 'KeeperGo' }],
  creator: 'KeeperGo',
  publisher: 'KeeperGo',
  formatDetection: {
    email: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KeeperGo - Hire a Goalkeeper for Your Match',
    description: 'Find and book goalkeepers for your amateur football matches across the Netherlands. Secure payments, verified ratings, instant booking.',
    url: '/',
    siteName: 'KeeperGo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KeeperGo - Hire a Goalkeeper for Your Match in the Netherlands',
      },
    ],
    locale: 'en_NL',
    alternateLocale: ['nl_NL'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KeeperGo - Hire a Goalkeeper for Your Match',
    description: 'Find and book goalkeepers for your amateur football matches across the Netherlands.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" defer></script>
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gray-950">
              {children}
            </div>
            <Toaster />
            <CookieConsentBanner />
            <GoogleAnalytics />
            <WebVitals />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
