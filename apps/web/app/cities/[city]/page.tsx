import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Goal, MapPin, Users, Star, Shield, ArrowRight, CheckCircle, Trophy } from 'lucide-react'
import { notFound } from 'next/navigation'

const CITIES: Record<string, {
  name: string
  nameFull: string
  description: string
  metaDescription: string
  venues: { name: string; type: string }[]
  whyHere: string[]
  neighborhoods: string[]
}> = {
  amsterdam: {
    name: 'Amsterdam',
    nameFull: 'Amsterdam',
    description: 'Amsterdam has a thriving amateur football scene with dozens of sports parks across the city. Whether you play outdoors at a sportpark or indoors at a sporthal, finding a complete team — especially a goalkeeper — can be a challenge. KeeperGo helps bridge that gap.',
    metaDescription: 'Hire a goalkeeper for your football match in Amsterdam. KeeperGo connects organizers with available goalkeepers across Amsterdam neighborhoods.',
    venues: [
      { name: 'Het Marnix (Sporthal & Oostenburg)', type: 'Indoor' },
      { name: 'Footy Park Amsterdam', type: '5-a-side' },
      { name: 'Indoor Soccer Events (Rhoneweg)', type: 'Indoor' },
      { name: 'Sportcentrum VU (Amstelveen)', type: 'Indoor' },
      { name: 'Municipal Sports Parks (24+ locations)', type: 'Outdoor' },
    ],
    whyHere: [
      'Dozens of sports parks and indoor halls available for rent via amsterdam.nl',
      'Large expat community — many international teams looking for goalkeepers',
      'Active amateur and recreational football scene year-round',
      'Strong indoor (zaalvoetbal) culture during winter months',
    ],
    neighborhoods: ['Amsterdam-Noord', 'Amsterdam-Zuid', 'Amsterdam-Oost', 'Amsterdam-West', 'Amstelveen', 'Nieuw-West']
  },
  rotterdam: {
    name: 'Rotterdam',
    nameFull: 'Rotterdam',
    description: 'Rotterdam is a city with deep football roots and a competitive amateur scene. Sportbedrijf Rotterdam manages over 200 sports locations across the city, offering both outdoor fields and indoor sports halls for rent. KeeperGo helps teams in Rotterdam find the goalkeeper they need.',
    metaDescription: 'Hire a goalkeeper for your football match in Rotterdam. KeeperGo connects organizers with available goalkeepers across Rotterdam.',
    venues: [
      { name: 'Sportbedrijf Rotterdam (200+ locations)', type: 'Outdoor & Indoor' },
      { name: 'Topsportcentrum Rotterdam', type: 'Indoor' },
      { name: 'WION Complex (artificial & natural grass)', type: 'Outdoor' },
    ],
    whyHere: [
      'Over 200 sports locations managed by Sportbedrijf Rotterdam',
      'Affordable field rental — from €29/hr for half a field via sportbedrijfrotterdam.nl',
      'Active amateur football and futsal community',
      'Multiple artificial grass fields available across the city',
    ],
    neighborhoods: ['Rotterdam-Zuid', 'Kralingen', 'Delfshaven', 'Hillegersberg', 'Feijenoord', 'Overschie']
  },
  utrecht: {
    name: 'Utrecht',
    nameFull: 'Utrecht',
    description: 'Utrecht offers 24 municipal sports parks with football fields available for rent via the city. Its central location in the Netherlands means goalkeepers can reach venues quickly. KeeperGo connects teams across Utrecht with available goalkeepers.',
    metaDescription: 'Hire a goalkeeper for your football match in Utrecht. KeeperGo connects organizers with available goalkeepers across Utrecht and surrounding areas.',
    venues: [
      { name: 'Sportpark Zoudenbalch', type: 'Outdoor' },
      { name: 'Sportpark Maarschalkerweerd', type: 'Outdoor' },
      { name: 'Footy Park Utrecht', type: '5-a-side' },
      { name: 'Sportpark Papendorp (Leidsche Rijn)', type: 'Outdoor' },
      { name: 'Municipal Sports Parks (24 locations)', type: 'Outdoor' },
    ],
    whyHere: [
      '24 municipal sports parks with football fields available for rent',
      'Central location — easy to reach from across the Netherlands',
      'Active student football community from Utrecht University and HU',
      'Field rental starts at €12.31/hr for associations via utrecht.nl',
    ],
    neighborhoods: ['Utrecht Centrum', 'Leidsche Rijn', 'De Meern', 'Overvecht', 'Zuilen', 'Vleuten']
  },
  'den-haag': {
    name: 'Den Haag',
    nameFull: 'The Hague (Den Haag)',
    description: 'The Hague has 16 sports halls and over 160 sports fields available for rent. From Sportcampus Zuiderpark to neighborhood sports halls, there\'s no shortage of places to play. KeeperGo helps teams in Den Haag find a goalkeeper when they need one.',
    metaDescription: 'Hire a goalkeeper for your football match in The Hague (Den Haag). KeeperGo connects organizers with available goalkeepers across Den Haag.',
    venues: [
      { name: 'Sportcampus Zuiderpark', type: 'Multi-sport' },
      { name: 'Ons Eibernest (Morgenstond)', type: 'Indoor & Outdoor' },
      { name: '16 municipal sports halls across the city', type: 'Indoor' },
      { name: '160+ municipal sports fields', type: 'Outdoor' },
    ],
    whyHere: [
      '16 sports halls and 160+ outdoor fields managed by the municipality',
      'Sportcampus Zuiderpark — open 7 days a week for events and matches',
      'Large international community with many expat football teams',
      'Active recreational football scene across all neighborhoods',
    ],
    neighborhoods: ['Scheveningen', 'Loosduinen', 'Ypenburg', 'Leidschenveen', 'Centrum', 'Laak']
  }
}

export async function generateStaticParams() {
  return Object.keys(CITIES).map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const resolvedParams = await params
  const city = CITIES[resolvedParams.city]
  if (!city) return { title: 'City Not Found' }

  return {
    title: `Find a Goalkeeper in ${city.name} | KeeperGo`,
    description: city.metaDescription,
    keywords: `goalkeeper, rental, ${city.name}, football, soccer, Netherlands, keeper huren ${city.name}, doelman ${city.name}`,
    openGraph: {
      title: `Find a Goalkeeper in ${city.name} | KeeperGo`,
      description: city.metaDescription,
      type: 'website',
    }
  }
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const resolvedParams = await params
  const city = CITIES[resolvedParams.city]
  if (!city) notFound()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header - same as homepage */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Goal className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-xl text-white">KeeperGo</span>
          </Link>
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

      {/* Hero Section - same pattern as homepage */}
      <section className="relative py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-10">
          <Badge className="mb-4 bg-lime-400/10 text-lime-400 border-lime-400/30 hover:bg-lime-400/20">
            <MapPin className="w-3 h-3 mr-1" /> {city.nameFull}
          </Badge>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Find the Perfect <span className="text-lime-400">Goalkeeper</span> in {city.name}
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Connect with skilled goalkeepers in {city.name}. Book instantly, play with confidence.
            Goalkeepers ready for your amateur football matches.
          </p>
        </div>

        {/* Hero Image - same as homepage using og-image.jpg */}
        <div className="max-w-5xl mx-auto relative">
          <div className="relative">
            <div className="relative aspect-video">
              <Image
                src="/og-image.jpg"
                alt={`KeeperGo - Find a goalkeeper in ${city.name}`}
                fill
                className="object-cover"
                priority
              />
              {/* Fade edges into background */}
              <div className="absolute inset-0 pointer-events-none" style={{
                boxShadow: 'inset 0 0 60px 30px rgb(3 7 18)',
              }} />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950/80 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
            </div>

            {/* Buttons overlaid on image - same as homepage */}
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

      {/* Football in City */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Football in {city.name}</h2>
          <p className="text-gray-400 mb-8">{city.description}</p>

          <div className="grid md:grid-cols-2 gap-4">
            {city.whyHere.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-lime-400 mt-0.5 shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - same as homepage */}
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

      {/* How It Works - same as homepage */}
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

      {/* Venues */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Where to Play in {city.name}</h2>
          <p className="text-gray-400 mb-6">You choose the venue — we help you find the goalkeeper. Here are some options for renting fields in {city.name}:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {city.venues.map((venue, i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-lime-400 shrink-0" />
                    <span className="text-gray-200">{venue.name}</span>
                  </div>
                  <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">{venue.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Areas Covered */}
      <section className="py-16 px-4 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Areas in {city.name}</h2>
          <div className="flex flex-wrap gap-3">
            {city.neighborhoods.map((n, i) => (
              <Badge key={i} className="bg-gray-800 text-gray-300 border-gray-700 text-sm py-1.5 px-3">
                <MapPin className="w-3 h-3 mr-1" /> {n}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - same as homepage */}
      <section className="py-20 px-4 text-center bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <Trophy className="h-16 w-16 text-lime-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Goalkeeper in {city.name}?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Sign up for free and post your first match in under a minute.
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

      {/* Other Cities */}
      <section className="py-12 px-4 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Also Available In</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(CITIES)
              .filter(([slug]) => slug !== resolvedParams.city)
              .map(([slug, c]) => (
                <Link key={slug} href={`/cities/${slug}`}>
                  <Badge className="bg-gray-800 text-gray-300 border-gray-700 hover:border-lime-400 hover:text-lime-400 cursor-pointer text-sm py-1.5 px-4">
                    <MapPin className="w-3 h-3 mr-1" /> {c.name}
                  </Badge>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer - same as homepage */}
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
