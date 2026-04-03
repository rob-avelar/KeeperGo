export const dynamic = "force-dynamic"

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Goal, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PaymentCheckout from '@/components/payment-checkout'

export default async function PaymentPage({ params, searchParams }: { params: { id: string }, searchParams: { redirect_status?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      goalkeeper: {
        select: { id: true, name: true, email: true }
      },
      goalkeeperProfile: {
        select: {
          stripeAccountId: true,
          averageRating: true,
          totalMatches: true,
          city: true,
        }
      }
    }
  })

  if (!booking) {
    redirect('/organizer/dashboard')
  }

  if (booking.organizerId !== session.user.id) {
    redirect('/organizer/dashboard')
  }

  const goalkeeperEarning = Math.floor(booking.totalAmount * 0.75)
  const platformFee = booking.totalAmount - goalkeeperEarning

  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </div>
            <Link href="/organizer/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PaymentCheckout
          bookingId={booking.id}
          bookingDate={booking.date.toISOString()}
          bookingLocation={booking.location}
          bookingDuration={booking.duration}
          bookingFieldType={booking.fieldType}
          totalAmount={booking.totalAmount}
          goalkeeperEarning={goalkeeperEarning}
          platformFee={platformFee}
          goalkeeperName={booking.goalkeeper?.name || 'Goalkeeper'}
          goalkeeperRating={booking.goalkeeperProfile?.averageRating || 0}
          goalkeeperMatches={booking.goalkeeperProfile?.totalMatches || 0}
          bookingStatus={booking.status}
          redirectStatus={searchParams.redirect_status || null}
        />
      </main>
    </div>
  )
}
