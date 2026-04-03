import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Goal, Handshake, Building2, Trophy, Users, MapPin, ArrowRight, Mail, Star, Euro, Target, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partnerships | KeeperGo',
  description: 'Partner with KeeperGo - the #1 goalkeeper rental platform in the Netherlands. Explore sponsorship, venue, and corporate partnership opportunities.',
  keywords: 'KeeperGo partnerships, football sponsorship Netherlands, sports venue partnership, corporate football partnership',
}

const PARTNERSHIP_TYPES = [
  {
    icon: Building2,
    title: 'Venue Partners',
    subtitle: 'Sports Complexes & Football Fields',
    description: 'Put KeeperGo in front of thousands of players who use your facilities every week. We drive bookings, you get happier customers who always have a complete team.',
    benefits: [
      'Free promotion on our platform for your venue',
      'QR code displays for your front desk & pitches',
      'Priority listing for matches at your venue',
      'Monthly usage reports and player analytics',
    ],
    cta: 'Become a Venue Partner',
    ideal: 'Football fields, sports complexes, indoor arenas',
  },
  {
    icon: Trophy,
    title: 'League Partners',
    subtitle: 'Amateur Leagues & Tournaments',
    description: 'Give your league participants access to on-demand goalkeepers. Perfect for leagues where teams struggle to field a complete roster every week.',
    benefits: [
      'Exclusive discount codes for league members',
      'Co-branded league pages on KeeperGo',
      'Dedicated support for tournament days',
      'League statistics integration',
    ],
    cta: 'Partner Your League',
    ideal: 'KNVB amateur leagues, futsal leagues, corporate leagues',
  },
  {
    icon: Users,
    title: 'Corporate Partners',
    subtitle: 'Companies & Team Building',
    description: 'Offer your employees the ultimate team building experience with professional goalkeepers. Invoicing, bulk booking, and dedicated account management.',
    benefits: [
      'Corporate invoicing and monthly billing',
      'Bulk booking discounts (up to 20% off)',
      'Dedicated account manager',
      'Custom branded experiences for events',
    ],
    cta: 'Get Corporate Pricing',
    ideal: 'Companies with football teams, HR departments, event agencies',
  },
  {
    icon: Star,
    title: 'Brand Sponsors',
    subtitle: 'Sports Brands & Advertisers',
    description: 'Reach an engaged audience of football enthusiasts in the Netherlands. Our users are active, young professionals who love the sport.',
    benefits: [
      'Logo placement on the KeeperGo platform',
      'Sponsored match notifications ("Powered by [Brand]")',
      'Product placement opportunities for goalkeepers',
      'Social media co-marketing campaigns',
    ],
    cta: 'Explore Sponsorship',
    ideal: 'Sports brands, beverages, insurance, fitness',
  },
]

const AUDIENCE_STATS = [
  { label: 'Active Users', value: '500+', icon: Users },
  { label: 'Monthly Matches', value: '200+', icon: Target },
  { label: 'Cities Covered', value: '4+', icon: MapPin },
  { label: 'Average Rating', value: '4.8', icon: Star },
]

const TARGET_BRANDS = [
  { category: 'Sports Beverages', examples: 'Gatorade, AA Drink, Aquarius' },
  { category: 'Beer & Beverages', examples: 'Heineken, Amstel, Grolsch' },
  { category: 'Sports Equipment', examples: 'Nike, Adidas, Reusch, Puma' },
  { category: 'Insurance', examples: 'Centraal Beheer, Nationale-Nederlanden' },
  { category: 'Health & Fitness', examples: 'Fysio Fit, Basic-Fit, SportCity' },
  { category: 'Food & Delivery', examples: 'Thuisbezorgd, Dominos, Subway' },
]

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Goal className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-xl text-white">KeeperGo</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/contact">
              <Button size="sm" className="bg-lime-400 text-gray-950 hover:bg-lime-300">
                <Mail className="w-4 h-4 mr-1" /> Contact Us
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-lime-400/10 text-lime-400 border-lime-400/30">
            <Handshake className="w-3 h-3 mr-1" /> Partnership Opportunities
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Grow With KeeperGo
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join the #1 goalkeeper rental platform in the Netherlands. Partner with us to reach an engaged community of football enthusiasts.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-lime-400 text-gray-950 hover:bg-lime-300">
              Become a Partner <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Audience Stats */}
      <section className="py-12 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">Our Audience</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {AUDIENCE_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-5 w-5 text-lime-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Partnership Options</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Whether you\u2019re a sports venue, amateur league, corporation, or brand \u2014 there\u2019s a partnership model that works for you.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {PARTNERSHIP_TYPES.map((type, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800 hover:border-lime-400/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-lime-400/10">
                      <type.icon className="h-6 w-6 text-lime-400" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-100">{type.title}</CardTitle>
                      <CardDescription className="text-gray-400">{type.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{type.description}</p>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">What you get:</p>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-3">Ideal for: {type.ideal}</p>
                    <Link href="/contact">
                      <Button size="sm" className="bg-lime-400 text-gray-950 hover:bg-lime-300 w-full">
                        {type.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Brands */}
      <section className="py-16 px-4 bg-gray-900/50 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Who Should Partner With Us?</h2>
          <p className="text-gray-400 text-center mb-8">
            Our audience consists of active, 25-45 year old football enthusiasts in the Netherlands.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {TARGET_BRANDS.map((brand, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white text-sm mb-1">{brand.category}</h3>
                <p className="text-xs text-gray-400">{brand.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Sponsorship Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <Badge className="mb-3 bg-gray-700 text-gray-300 border-gray-600">Bronze</Badge>
                <h3 className="text-lg font-bold text-white mb-2">Community Sponsor</h3>
                <p className="text-sm text-gray-400 mb-4">Logo on footer, mentioned in monthly newsletter.</p>
                <p className="text-2xl font-bold text-lime-400">\u20ac100<span className="text-sm font-normal text-gray-400">/month</span></p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-lime-400/30">
              <CardContent className="pt-6 text-center">
                <Badge className="mb-3 bg-lime-400/10 text-lime-400 border-lime-400/30">Silver</Badge>
                <h3 className="text-lg font-bold text-white mb-2">Match Sponsor</h3>
                <p className="text-sm text-gray-400 mb-4">Logo on match pages, branded notifications, social media mentions.</p>
                <p className="text-2xl font-bold text-lime-400">\u20ac300<span className="text-sm font-normal text-gray-400">/month</span></p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <Badge className="mb-3 bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Gold</Badge>
                <h3 className="text-lg font-bold text-white mb-2">Platform Sponsor</h3>
                <p className="text-sm text-gray-400 mb-4">Exclusive branding, product placement, co-marketing campaigns.</p>
                <p className="text-2xl font-bold text-lime-400">Custom</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Let\u2019s Build Something Together
          </h2>
          <p className="text-gray-400 mb-8">
            Whether you want to sponsor matches, partner your venue, or reach our audience \u2014 we\u2019d love to hear from you.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-lime-400 text-gray-950 hover:bg-lime-300">
              <Mail className="w-4 h-4 mr-2" /> Get in Touch
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Goal className="h-5 w-5 text-lime-400" />
            <span className="font-semibold text-white">KeeperGo</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/contact" className="hover:text-lime-400">Contact</Link>
            <Link href="/privacy" className="hover:text-lime-400">Privacy</Link>
            <Link href="/cookies" className="hover:text-lime-400">Cookies</Link>
            <Link href="/terms" className="hover:text-lime-400">Terms</Link>
          </div>
          <p className="text-sm text-gray-500">\u00a9 {new Date().getFullYear()} KeeperGo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
