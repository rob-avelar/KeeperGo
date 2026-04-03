import { ArrowLeft, Goal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'KeeperGo Cookie Policy — information about the cookies we use and how to manage them.',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">1. What Are Cookies?</h2>
              <p className="text-gray-300 leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. They help 
                the website function properly, remember your preferences, and provide us with information 
                about how the site is used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">2. Cookies We Use</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-200 mb-2">2.1 Strictly Necessary Cookies</h3>
                  <p className="mb-2">These cookies are essential for the platform to function. They cannot be disabled.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-700">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Cookie</th>
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Purpose</th>
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 px-3 border border-gray-700 font-mono text-sm">next-auth.session-token</td>
                          <td className="py-2 px-3 border border-gray-700">Authentication session</td>
                          <td className="py-2 px-3 border border-gray-700">Session / 30 days</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 px-3 border border-gray-700 font-mono text-sm">next-auth.csrf-token</td>
                          <td className="py-2 px-3 border border-gray-700">CSRF protection</td>
                          <td className="py-2 px-3 border border-gray-700">Session</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 px-3 border border-gray-700 font-mono text-sm">next-auth.callback-url</td>
                          <td className="py-2 px-3 border border-gray-700">Redirect after login</td>
                          <td className="py-2 px-3 border border-gray-700">Session</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 border border-gray-700 font-mono text-sm">cookie-consent</td>
                          <td className="py-2 px-3 border border-gray-700">Stores your cookie preferences</td>
                          <td className="py-2 px-3 border border-gray-700">365 days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-200 mb-2">2.2 Analytics Cookies</h3>
                  <p className="mb-2">These cookies help us understand how visitors interact with our platform. They are only set with your consent.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-700">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Cookie</th>
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Purpose</th>
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Provider</th>
                          <th className="text-left py-2 px-3 border border-gray-700 text-gray-200">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 px-3 border border-gray-700 font-mono text-sm">_ga</td>
                          <td className="py-2 px-3 border border-gray-700">Distinguishes unique users</td>
                          <td className="py-2 px-3 border border-gray-700">Google Analytics</td>
                          <td className="py-2 px-3 border border-gray-700">2 years</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-2 px-3 border border-gray-700 font-mono text-sm">_ga_*</td>
                          <td className="py-2 px-3 border border-gray-700">Maintains session state</td>
                          <td className="py-2 px-3 border border-gray-700">Google Analytics</td>
                          <td className="py-2 px-3 border border-gray-700">2 years</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">3. Third-Party Cookies</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">The following third-party services may set cookies when you use our platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Stripe:</strong> Payment processing cookies for secure transactions. See{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:text-lime-300 underline">Stripe&apos;s Privacy Policy</a>.
                  </li>
                  <li><strong>Google:</strong> Authentication cookies for Google Sign-In (SSO). See{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:text-lime-300 underline">Google&apos;s Privacy Policy</a>.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Managing Your Cookie Preferences</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  When you first visit our website, a cookie consent banner allows you to accept or decline 
                  non-essential cookies. You can change your preferences at any time by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Clicking the &quot;Cookie Settings&quot; link in the website footer</li>
                  <li>Adjusting your browser settings to block or delete cookies</li>
                  <li>Using your browser&apos;s &quot;Do Not Track&quot; setting</li>
                </ul>
                <p className="mt-3">
                  Note that blocking essential cookies may affect the functionality of the platform (e.g., 
                  you will not be able to stay logged in).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">5. Legal Basis</h2>
              <p className="text-gray-300 leading-relaxed">
                Strictly necessary cookies are placed under Article 6(1)(f) GDPR (legitimate interest) and 
                the Dutch Telecommunicatiewet (Article 11.7a). Analytics and non-essential cookies require 
                your explicit consent under the ePrivacy Directive and the Telecommunicatiewet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Cookie Policy from time to time. Changes will be posted on this page with 
                an updated &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">7. Contact</h2>
              <div className="text-gray-300 leading-relaxed">
                <p>For questions about our use of cookies, contact us at:</p>
                <p className="mt-2"><strong>Email:</strong> privacy@keepergo.nl</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>© 2026 KeeperGo. All rights reserved.</p>
      </footer>
    </div>
  )
}
