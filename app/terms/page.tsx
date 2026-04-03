import { ArrowLeft, Goal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'KeeperGo Terms of Service — the rules and conditions for using our goalkeeper booking platform.',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using the KeeperGo platform (&quot;Platform&quot;), you agree to comply with and be 
                bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, 
                you must not use our services. These Terms constitute a legally binding agreement between you 
                and KeeperGo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">2. Service Description</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  KeeperGo operates as a <strong>digital intermediary platform</strong> (bemiddelingsplatform) that 
                  connects football match organisers with independent goalkeepers available for hire in the Netherlands.
                </p>
                <p className="mb-3">
                  <strong>KeeperGo is not a party to any agreement</strong> between organisers and goalkeepers. 
                  We facilitate the booking, payment, and communication process, but the actual service 
                  (goalkeeping) is provided directly by the goalkeeper to the organiser.
                </p>
                <p>
                  KeeperGo does not employ, supervise, or control the goalkeepers registered on the platform. 
                  Goalkeepers operate as independent service providers (zelfstandige dienstverleners).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">3. User Types and Eligibility</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3"><strong>Organisers:</strong> Users who create matches and hire goalkeepers through the Platform.</p>
                <p className="mb-3"><strong>Goalkeepers:</strong> Independent service providers who offer their goalkeeping services through the Platform.</p>
                <p className="mb-3">
                  To use the Platform, you must be at least <strong>18 years old</strong> and have legal capacity 
                  to enter into binding agreements under Dutch law.
                </p>
                <p>
                  By registering as a goalkeeper, you confirm that you are operating as an independent professional 
                  or freelancer (ZZP&apos;er) and are solely responsible for your own tax obligations, insurance, 
                  and compliance with applicable laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Goalkeeper Independent Contractor Status</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  Goalkeepers using this Platform are <strong>independent contractors</strong> and not employees, 
                  workers, agents, or representatives of KeeperGo. In accordance with the Dutch Wet 
                  Deregulering Beoordeling Arbeidsrelaties (Wet DBA):
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-3">
                  <li>Goalkeepers have full freedom to accept or decline any booking request</li>
                  <li>Goalkeepers set their own hourly rates within platform guidelines</li>
                  <li>Goalkeepers determine their own availability and service areas</li>
                  <li>KeeperGo does not provide instructions on how to perform goalkeeping services</li>
                  <li>Goalkeepers may offer their services through other platforms or channels simultaneously</li>
                  <li>Goalkeepers are responsible for their own equipment</li>
                </ul>
                <p>
                  This arrangement ensures compliance with Dutch labour law. Goalkeepers are strongly advised 
                  to register with the KVK (Kamer van Koophandel) and consult a tax advisor regarding their 
                  obligations, including VAT (BTW) and income tax.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">5. Registration and Account</h2>
              <p className="text-gray-300 leading-relaxed">
                You must create an account by providing accurate and complete information. You are responsible 
                for maintaining the confidentiality of your account credentials. You must immediately notify us 
                of any unauthorised use of your account. KeeperGo reserves the right to suspend or terminate 
                accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Payments and Fees</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2">The minimum hourly rate is €20.</p>
                <p className="mb-2">A service fee is included in each transaction to cover platform operating costs, payment processing, and service improvement.</p>
                <p className="mb-2">All payments are processed securely through Stripe, a PCI DSS Level 1 certified payment provider. KeeperGo does not store or have access to your full payment card details.</p>
                <p>Direct bookings may include an additional premium on the base price.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">7. Right of Withdrawal (Herroepingsrecht)</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  Under EU consumer protection law (Directive 2011/83/EU) and Dutch civil law (Burgerlijk 
                  Wetboek, Book 6, Title 5, Section 2b), consumers generally have a 14-day right of withdrawal 
                  for online purchases.
                </p>
                <p className="mb-3">
                  However, in accordance with Article 6:230p(e) BW, this right <strong>does not apply</strong> to 
                  services related to leisure activities if the agreement provides for a specific date or period 
                  of performance. Since goalkeeper bookings are made for a specific match date and time, the 
                  right of withdrawal does not apply once the booking is confirmed.
                </p>
                <p>
                  By confirming a booking, you expressly agree that the service will be performed on the 
                  agreed date and acknowledge that the right of withdrawal expires once the booking is confirmed.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">8. Cancellation Policy</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2"><strong>Organisers:</strong> Free cancellation up to 6 hours before the match. After this period, penalties may apply.</p>
                <p><strong>Goalkeepers:</strong> Frequent cancellations may result in warnings and eventual account suspension. Cancellations within 24 hours of the match may result in negative impact on your profile rating.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">9. No-Show Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                If a goalkeeper fails to attend a confirmed match without prior cancellation, the organiser 
                may report it within 48 hours for a full refund. Repeated no-shows will result in account 
                suspension or permanent ban from the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">10. Ratings and Reviews</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  After each completed match, organisers are encouraged to rate goalkeepers. Ratings are based 
                  on multi-criteria evaluation including punctuality, attitude, and skill.
                </p>
                <p>
                  In accordance with the EU Omnibus Directive (2019/2161), we confirm that only users who 
                  have completed a verified booking can submit ratings. We do not manipulate or selectively 
                  display ratings. The ranking of goalkeepers on the platform is determined by average rating 
                  score and proximity to the match location.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">11. Liability and Disclaimer</h2>
              <div className="text-gray-300 leading-relaxed">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3">
                  <p className="font-semibold text-gray-200 mb-2">⚠️ Important Notice</p>
                  <p>
                    KeeperGo acts solely as an intermediary platform. We are <strong>not responsible</strong> for 
                    any injuries, accidents, physical harm, property damage, or disputes that may occur 
                    before, during, or after football matches arranged through the Platform.
                  </p>
                </div>
                <p className="mb-3">
                  Football is an inherently physical sport that carries risk of injury. By using the Platform, 
                  all users acknowledge and accept these inherent risks.
                </p>
                <p className="mb-3"><strong>Organisers are responsible for:</strong></p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li>Ensuring the playing venue is safe and suitable</li>
                  <li>Providing adequate first-aid facilities at the match location</li>
                  <li>Maintaining appropriate insurance for the event (e.g., evenementenverzekering)</li>
                </ul>
                <p className="mb-3"><strong>Goalkeepers are responsible for:</strong></p>
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li>Maintaining personal liability insurance (aansprakelijkheidsverzekering, AVP)</li>
                  <li>Ensuring they are physically fit to participate</li>
                  <li>Bringing appropriate and safe equipment</li>
                </ul>
                <p>
                  KeeperGo strongly recommends that all participants have appropriate personal insurance 
                  coverage. We are not liable for any direct, indirect, incidental, or consequential damages 
                  arising from the use of the Platform, to the maximum extent permitted by Dutch law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">12. Tax Obligations (DAC7)</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  Under EU Directive 2021/514 (DAC7), KeeperGo is required to collect and report information 
                  about goalkeepers who earn income through the Platform to the Dutch Tax Authority (Belastingdienst).
                </p>
                <p className="mb-3">
                  Goalkeepers are solely responsible for their own tax compliance, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Registration with the Belastingdienst</li>
                  <li>Filing income tax returns (inkomstenbelasting)</li>
                  <li>VAT (BTW) registration and filing when applicable</li>
                  <li>Maintaining accurate financial records</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">13. Privacy and Data Protection</h2>
              <p className="text-gray-300 leading-relaxed">
                Your personal data is processed in accordance with our{' '}
                <Link href="/privacy" className="text-lime-400 hover:text-lime-300 underline">Privacy Policy</Link>, 
                which complies with the General Data Protection Regulation (GDPR) and the Dutch 
                Uitvoeringswet AVG. We also use cookies as described in our{' '}
                <Link href="/cookies" className="text-lime-400 hover:text-lime-300 underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">14. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All content on the Platform, including but not limited to logos, design, software, and text, 
                is the property of KeeperGo and is protected by Dutch and international intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">15. Dispute Resolution</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  In case of disputes between organisers and goalkeepers, we encourage users to first attempt 
                  to resolve matters amicably through the Platform&apos;s support channels.
                </p>
                <p>
                  If no resolution is reached, disputes may be submitted to the competent court in Amsterdam, 
                  the Netherlands. For consumer disputes, EU residents may also use the EU Online Dispute 
                  Resolution platform at{' '}
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:text-lime-300 underline">
                    ec.europa.eu/consumers/odr
                  </a>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">16. Modifications to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be communicated 
                to users via email or through a notice on the Platform at least 15 days before taking effect. 
                Continued use of the Platform after modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">17. Applicable Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms are governed by the laws of the Netherlands. The application of the Vienna 
                Convention on the International Sale of Goods (CISG) is excluded.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">18. Contact</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2">For questions about these Terms, contact us at:</p>
                <p><strong>Email:</strong> contact@keepergo.nl</p>
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
