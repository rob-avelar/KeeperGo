
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NotificationPreferences from '@/components/notification-preferences'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Goal, ArrowLeft } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }


  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </Link>
            <Link href="/organizer/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Settings</h2>
          <p className="text-gray-400">
            Manage your notification preferences and account settings
          </p>
        </div>

        <NotificationPreferences />
      </div>
    </div>
  )
}
