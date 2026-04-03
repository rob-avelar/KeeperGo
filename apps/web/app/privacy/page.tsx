import { ArrowLeft, Goal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'KeeperGo Privacy Policy — how we collect, use, and protect your personal data under GDPR/AVG.',
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                KeeperGo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy describes how 
                we collect, use, share, and protect your personal data in accordance with the General Data 
                Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;) and the Dutch Implementation Act 
                (Uitvoeringswet AVG).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">2. Data Controller</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2">The data controller for your personal data is:</p>
                <p className="mb-1"><strong>KeeperGo</strong></p>
                <p className="mb-1">The Netherlands</p>
                <p className="mb-1">Email: privacy@keepergo.nl</p>
                <p>Website: https://keepergo.nl</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">3. Personal Data We Collect</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We collect and process the following categories of personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Identity data:</strong> Full name, email address, account credentials</li>
                  <li><strong>Profile data:</strong> Profile photo, city/location, playing experience, availability (for goalkeepers)</li>
                  <li><strong>Financial data:</strong> Payment information processed securely through Stripe; Stripe Connect account details for goalkeepers</li>
                  <li><strong>Transaction data:</strong> Booking history, payment amounts, invoices, platform fees</li>
                  <li><strong>Rating data:</strong> Reviews, ratings, and feedback from match participants</li>
                  <li><strong>Technical data:</strong> IP address, browser type and version, device information, operating system</li>
                  <li><strong>Usage data:</strong> Pages visited, features used, timestamps, referral sources</li>
                  <li><strong>Communication data:</strong> Notifications sent and received, support correspondence</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Purposes and Legal Basis for Processing</h2>
              <div className="text-gray-300 leading-relaxed">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 pr-4 text-gray-200">Purpose</th>
                        <th className="text-left py-2 text-gray-200">Legal Basis (Art. 6 GDPR)</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Provide platform services (matching, booking)</td><td className="py-2">Performance of contract</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Process payments and transfers</td><td className="py-2">Performance of contract</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Send booking notifications and reminders</td><td className="py-2">Performance of contract</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Analytics and service improvement</td><td className="py-2">Legitimate interest</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Fraud prevention and platform security</td><td className="py-2">Legitimate interest</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Marketing communications</td><td className="py-2">Consent</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Tax reporting (DAC7 obligations)</td><td className="py-2">Legal obligation</td></tr>
                      <tr className="border-b border-gray-800"><td className="py-2 pr-4">Respond to legal requests</td><td className="py-2">Legal obligation</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">5. DAC7 Tax Reporting</h2>
              <p className="text-gray-300 leading-relaxed">
                Under EU Directive 2021/514 (DAC7), KeeperGo is obligated to collect and report certain 
                information about goalkeepers (sellers) who earn income through the platform to the Dutch 
                Tax Authority (Belastingdienst). This includes your name, address, tax identification number 
                (BSN), date of birth, bank account details, and total income earned via the platform. This 
                reporting is mandatory and cannot be opted out of. The data is shared exclusively with the 
                Belastingdienst in accordance with Dutch tax law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Data Sharing</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We share your personal data with the following categories of recipients:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Other platform users:</strong> Your name and ratings are visible to other users for booking purposes</li>
                  <li><strong>Stripe (Payment Processor):</strong> Payment data is processed by Stripe Payments Europe, Ltd., which is PCI DSS Level 1 certified</li>
                  <li><strong>Hosting providers:</strong> Cloud infrastructure for platform operation</li>
                  <li><strong>Analytics providers:</strong> Google Analytics (with IP anonymisation enabled) for service improvement</li>
                  <li><strong>Tax authorities:</strong> The Dutch Belastingdienst under DAC7 obligations</li>
                  <li><strong>Law enforcement:</strong> When required by Dutch or EU law, court order, or regulatory request</li>
                </ul>
                <p className="mt-3">
                  We have entered into Data Processing Agreements (Verwerkersovereenkomsten) with all processors 
                  in accordance with Article 28 GDPR.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">7. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Some of our service providers may process data outside the European Economic Area (EEA). 
                Where this occurs, we ensure adequate safeguards are in place, including EU Standard 
                Contractual Clauses (SCCs) approved by the European Commission, or reliance on an 
                adequacy decision. Stripe processes payment data under the EU-US Data Privacy Framework.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">8. Data Retention</h2>
              <div className="text-gray-300 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account data:</strong> Retained for the duration of your active account, plus 30 days after deletion request</li>
                  <li><strong>Transaction and payment data:</strong> Retained for 7 years after the transaction, as required by Dutch tax law (Algemene wet inzake rijksbelastingen)</li>
                  <li><strong>DAC7 reporting data:</strong> Retained for 5 years after reporting</li>
                  <li><strong>Analytics data:</strong> Aggregated and anonymised after 26 months</li>
                  <li><strong>Communication records:</strong> Retained for 2 years after the last interaction</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">9. Your Rights Under GDPR</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">Under the GDPR, you have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right of access (Art. 15):</strong> Obtain confirmation of whether we process your data and request a copy</li>
                  <li><strong>Right to rectification (Art. 16):</strong> Correct inaccurate or incomplete personal data</li>
                  <li><strong>Right to erasure (Art. 17):</strong> Request deletion of your data (&quot;right to be forgotten&quot;), subject to legal retention obligations</li>
                  <li><strong>Right to restriction (Art. 18):</strong> Restrict the processing of your data in certain circumstances</li>
                  <li><strong>Right to data portability (Art. 20):</strong> Receive your data in a structured, commonly used, machine-readable format</li>
                  <li><strong>Right to object (Art. 21):</strong> Object to processing based on legitimate interest, including profiling</li>
                  <li><strong>Right to withdraw consent (Art. 7):</strong> Withdraw consent at any time, without affecting the lawfulness of prior processing</li>
                  <li><strong>Right not to be subject to automated decision-making (Art. 22):</strong> We do not make solely automated decisions with legal effects</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, contact us at <strong>privacy@keepergo.nl</strong>. We will respond 
                  within 30 days (one calendar month) as required by the GDPR.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">10. Cookies and Tracking</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We use cookies and similar technologies on our platform. For full details, see our{' '}
                  <Link href="/cookies" className="text-lime-400 hover:text-lime-300 underline">Cookie Policy</Link>.
                </p>
                <p>You can manage your cookie preferences at any time through the cookie settings on our platform or through your browser settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">11. Security Measures</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We implement appropriate technical and organisational measures to protect your personal data, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                  <li>Secure password hashing (bcrypt)</li>
                  <li>Role-based access controls</li>
                  <li>Regular security reviews</li>
                  <li>PCI DSS compliant payment processing via Stripe</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">12. Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                KeeperGo is not intended for use by individuals under the age of 18. We do not knowingly 
                collect personal data from minors. If we become aware that we have collected data from a 
                person under 18, we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">13. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or legal requirements. We will notify you of significant changes by email or through 
                a notice on the platform. The &quot;Last updated&quot; date at the top indicates when the 
                policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">14. Contact and Complaints</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  For questions about this Privacy Policy, to exercise your data rights, or for any 
                  privacy-related concerns, contact us at:
                </p>
                <p className="mb-1"><strong>Email:</strong> privacy@keepergo.nl</p>
                <p className="mt-4">
                  If you believe your data protection rights have been violated, you have the right to 
                  lodge a complaint with the Dutch Data Protection Authority:
                </p>
                <p className="mt-2"><strong>Autoriteit Persoonsgegevens (AP)</strong></p>
                <p>Bezuidenhoutseweg 30, 2594 AV Den Haag</p>
                <p>Website: <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:text-lime-300 underline">autoriteitpersoonsgegevens.nl</a></p>
                <p>Phone: +31 (0)70 888 8500</p>
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
