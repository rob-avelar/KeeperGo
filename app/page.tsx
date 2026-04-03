
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  Euro,
  ArrowRight,
  Goal,
  Trophy,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  // If user is already logged in, redirect to their dashboard
  const session = await auth()
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin/dashboard')
  } else if (session?.user?.role === 'GOALKEEPER') {
    redirect('/goalkeeper/dashboard')
  } else if (session?.user?.role === 'ORGANIZER') {
    redirect('/organizer/dashboard')
  } else if (session?.user && !session?.user?.role) {
    redirect('/auth/complete-registration?email=' + encodeURIComponent(session.user.email || ''))
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KeeperGo',
    url: 'https://keepergo.nl',
    description: 'Hire a goalkeeper for your amateur football match in the Netherlands.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://keepergo.nl/cities/{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KeeperGo',
    url: 'https://keepergo.nl',
    logo: 'https://keepergo.nl/og-image.jpg',
    description: 'The goalkeeper rental platform for amateur football in the Netherlands.',
    areaServed: {
      '@type': 'Country',
      name: 'Netherlands',
    },
    serviceType: 'Goalkeeper Rental',
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Goal className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-xl text-white">KeeperGo</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/organizer/signin">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-lime-400 hover:bg-gray-800">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Organizer</span> Login
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signin">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-lime-400 hover:bg-gray-800">
                <Goal className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Goalkeeper</span> Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-10">
          <Badge className="mb-4 bg-lime-400/10 text-lime-400 border-lime-400/30 hover:bg-lime-400/20">
            #1 Goalkeeper Platform in Netherlands
          </Badge>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Find the Perfect <span className="text-lime-400">Goalkeeper</span> for Your Match
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Connect with skilled goalkeepers in your area. Book instantly, play with confidence. 
            Goalkeepers ready for your amateur football matches across the Netherlands.
          </p>
        </div>

        {/* Hero Image - merges into background */}
        <div className="max-w-5xl mx-auto relative">
          {/* Gradient overlays to blend image into background */}
          <div className="relative">
            <div className="relative aspect-video">
              <Image
                src="/og-image.jpg"
                alt="KeeperGo - Never play without a keeper again"
                fill
                className="object-cover"
                priority
              />
              {/* Fade edges into background */}
              <div className="absolute inset-0 pointer-events-none" style={{
                boxShadow: 'inset 0 0 60px 30px rgb(3 7 18)',
              }} />
              {/* Subtle bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950/80 to-transparent pointer-events-none" />
              {/* Top fade */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
              {/* Left fade */}
              <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
              {/* Right fade */}
              <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
            </div>

            {/* Buttons overlaid on image - same size */}
            <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex justify-between px-4 sm:px-10">
              <Link href="/auth/organizer/signin" className="w-[48%] sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-[220px] bg-lime-400 text-gray-950 hover:bg-lime-300 font-extrabold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 shadow-lg shadow-lime-400/30 uppercase tracking-wide"
                >
                  Find My Keeper
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </Button>
              </Link>
              <Link href="/auth/goalkeeper/signin" className="w-[48%] sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-[220px] bg-lime-400 text-gray-950 hover:bg-lime-300 font-extrabold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 shadow-lg shadow-lime-400/30 uppercase tracking-wide"
                >
                  {"I'm Goalkeeper"}
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose KeeperGo?
            </h2>
            <p className="text-xl text-gray-400">
              The most trusted platform for goalkeeper bookings in the Netherlands
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 shadow-lg hover:shadow-xl hover:border-lime-400/30 transition-all">
              <CardHeader>
                <MapPin className="h-12 w-12 text-lime-400 mb-4" />
                <CardTitle className="text-white">Location-Based Matching</CardTitle>
                <CardDescription className="text-gray-400">
                  Find goalkeepers near your match location with intelligent geolocation matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-gray-300">Real-time proximity search</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-gray-300">Interactive map interface</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 shadow-lg hover:shadow-xl hover:border-lime-400/30 transition-all">
              <CardHeader>
                <Star className="h-12 w-12 text-lime-400 mb-4" />
                <CardTitle className="text-white">Verified Ratings</CardTitle>
                <CardDescription className="text-gray-400">
                  Comprehensive rating system for punctuality, attitude, and technical skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-gray-300">Multi-criteria ratings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-gray-300">Detailed match history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 shadow-lg hover:shadow-xl hover:border-lime-400/30 transition-all">
              <CardHeader>
                <Shield className="h-12 w-12 text-lime-400 mb-4" />
                <CardTitle className="text-white">Secure Payments</CardTitle>
                <CardDescription className="text-gray-400">
                  Safe and secure payment processing with transparent pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-gray-300">Stripe payment integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-gray-300">Transparent fee structure</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Simple steps to get your goalkeeper</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Organizers */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Users className="h-6 w-6 text-lime-400 mr-2" />
                For Match Organizers
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-lime-400 text-gray-950 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Post Your Match</h4>
                    <p className="text-gray-400">Add match details: date, time, location, and field type</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-lime-400 text-gray-950 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Book &amp; Pay</h4>
                    <p className="text-gray-400">Secure payment and instant confirmation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Goalkeepers */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Goal className="h-6 w-6 text-lime-400 mr-2" />
                For Goalkeepers
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-lime-400 text-gray-950 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Create Profile</h4>
                    <p className="text-gray-400">Set your availability, rates, and service area</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-lime-400 text-gray-950 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Accept Bookings</h4>
                    <p className="text-gray-400">Review match requests and accept ones that fit</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-lime-400 text-gray-950 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Play &amp; Earn</h4>
                    <p className="text-gray-400">Show up, play great, and earn money</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <Trophy className="h-16 w-16 text-lime-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Goalkeeper?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of satisfied players and goalkeepers on KeeperGo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/organizer/signup">
              <Button size="lg" className="bg-lime-400 text-gray-950 hover:bg-lime-300 font-bold px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                Sign Up as Organizer
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signup">
              <Button size="lg" className="bg-gray-800 text-white border-2 border-gray-600 hover:bg-gray-700 hover:border-lime-400/50 px-8 py-3">
                <Goal className="w-5 h-5 mr-2" />
                Sign Up as Goalkeeper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-12 px-4 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Available in</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { slug: 'amsterdam', name: 'Amsterdam' },
              { slug: 'rotterdam', name: 'Rotterdam' },
              { slug: 'utrecht', name: 'Utrecht' },
              { slug: 'den-haag', name: 'The Hague' },
            ].map(city => (
              <Link key={city.slug} href={`/cities/${city.slug}`}>
                <Badge className="bg-gray-800 text-gray-300 border-gray-700 hover:border-lime-400 hover:text-lime-400 cursor-pointer text-sm py-1.5 px-4">
                  <MapPin className="w-3 h-3 mr-1" /> {city.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Goal className="h-6 w-6 text-lime-400" />
              <span className="font-bold text-xl">KeeperGo</span>
            </div>
            <div className="flex items-center gap-6 text-gray-500">
              <Link href="/partnerships" className="hover:text-lime-400 transition-colors">
                Partnerships
              </Link>
              <Link href="/contact" className="hover:text-lime-400 transition-colors">
                Contact Us
              </Link>
              <Link href="/privacy" className="hover:text-lime-400 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-lime-400 transition-colors">
                Cookies
              </Link>
              <Link href="/terms" className="hover:text-lime-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2026 KeeperGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
