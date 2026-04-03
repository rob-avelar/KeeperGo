// KeeperGo Email Notification System
// Uses Abacus.AI Notification Email API for real email delivery

interface SendNotificationEmailParams {
  recipientEmail: string
  subject: string
  htmlBody: string
  notificationId: string
}

export async function sendNotificationEmail({
  recipientEmail,
  subject,
  htmlBody,
  notificationId,
}: SendNotificationEmailParams): Promise<boolean> {
  try {
    const appUrl = process.env.NEXTAUTH_URL || 'https://keepergo.nl'
    const hostname = new URL(appUrl).hostname
    const senderEmail = `noreply@${hostname}`

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: notificationId,
        subject,
        body: htmlBody,
        is_html: true,
        recipient_email: recipientEmail,
        sender_email: senderEmail,
        sender_alias: 'KeeperGo',
      }),
    })

    const result = await response.json()
    if (!result.success) {
      if (result.notification_disabled) {
        console.log(`[Email] Notification disabled by user, skipping: ${subject}`)
        return true
      }
      console.error(`[Email] Failed to send: ${result.message || 'Unknown error'}`)
      return false
    }

    console.log(`[Email] Sent successfully: ${subject} → ${recipientEmail}`)
    return true
  } catch (error) {
    console.error('[Email] Error sending notification:', error)
    return false
  }
}

// Shared email wrapper/layout
function emailLayout(content: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #e5e5e5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%); padding: 24px 32px; text-align: center; border-bottom: 2px solid #a3e635;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #a3e635; letter-spacing: -0.5px;">⚽ KeeperGo</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Professional Goalkeeper Rentals</p>
      </div>
      <div style="padding: 32px;">
        ${content}
      </div>
      <div style="background-color: #111; padding: 20px 32px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          © ${new Date().getFullYear()} KeeperGo — keepergo.nl
        </p>
      </div>
    </div>
  `
}

function matchDetailsBlock(date: Date, location: string, extra?: string): string {
  const dateStr = date.toLocaleDateString('en-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' })
  return `
    <div style="background-color: #1a1a2e; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #a3e635;">
      <p style="margin: 4px 0; font-size: 14px;"><strong style="color: #a3e635;">📅 Date:</strong> ${dateStr}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong style="color: #a3e635;">🕐 Time:</strong> ${timeStr}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong style="color: #a3e635;">📍 Location:</strong> ${location}</p>
      ${extra || ''}
    </div>
  `
}

// ---- Email Templates ----

export const emailTemplates = {
  bookingAccepted: (organizerName: string, goalkeeperName: string, date: Date, location: string) => {
    const html = emailLayout(`
      <h2 style="color: #a3e635; margin: 0 0 8px;">Goalkeeper Accepted Your Match! 🎉</h2>
      <p style="color: #d4d4d4; font-size: 15px;">Hi ${organizerName},</p>
      <p style="color: #d4d4d4; font-size: 15px;"><strong style="color: #fff;">${goalkeeperName}</strong> has accepted your booking. Please complete the payment to confirm the match.</p>
      ${matchDetailsBlock(date, location)}
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://keepergo.nl/organizer/dashboard" style="display: inline-block; background-color: #a3e635; color: #0a0a0a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">Go to Dashboard →</a>
      </div>
      <p style="color: #888; font-size: 13px;">Complete payment from your dashboard to lock in the goalkeeper.</p>
    `)
    return { subject: `✅ ${goalkeeperName} accepted your match!`, html }
  },

  bookingCancelled: (userName: string, role: string, date: Date, location: string, reason?: string) => {
    const isOrganizer = role === 'ORGANIZER'
    const html = emailLayout(`
      <h2 style="color: #f87171; margin: 0 0 8px;">Match Cancelled ❌</h2>
      <p style="color: #d4d4d4; font-size: 15px;">Hi ${userName},</p>
      <p style="color: #d4d4d4; font-size: 15px;">A match booking has been cancelled.</p>
      ${matchDetailsBlock(date, location, reason ? `<p style="margin: 4px 0; font-size: 14px;"><strong style="color: #f87171;">Reason:</strong> ${reason}</p>` : '')}
      <p style="color: #d4d4d4; font-size: 15px;">${isOrganizer ? 'You can book another goalkeeper from your dashboard.' : 'You can find more opportunities in your dashboard.'}</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://keepergo.nl/${isOrganizer ? 'organizer' : 'goalkeeper'}/dashboard" style="display: inline-block; background-color: #a3e635; color: #0a0a0a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">Open Dashboard →</a>
      </div>
    `)
    return { subject: `❌ Match on ${date.toLocaleDateString('en-NL')} cancelled`, html }
  },

  matchReminder: (userName: string, role: string, date: Date, location: string, hoursUntil: number) => {
    const isOrganizer = role === 'ORGANIZER'
    const html = emailLayout(`
      <h2 style="color: #facc15; margin: 0 0 8px;">Match Reminder ⏰</h2>
      <p style="color: #d4d4d4; font-size: 15px;">Hi ${userName},</p>
      <p style="color: #d4d4d4; font-size: 15px;">Your match is in <strong style="color: #facc15;">${hoursUntil} hours</strong>!</p>
      ${matchDetailsBlock(date, location)}
      <p style="color: #d4d4d4; font-size: 15px;">${isOrganizer ? 'Make sure everything is ready for the match!' : "Don't forget your gear! 🧤"}</p>
      <p style="color: #888; font-size: 13px;">Good luck! ⚽</p>
    `)
    return { subject: `⏰ ${hoursUntil}h until your match at ${location}`, html }
  },

  paymentReceived: (goalkeeperName: string, amount: number, date: Date, location: string) => {
    const html = emailLayout(`
      <h2 style="color: #a3e635; margin: 0 0 8px;">Payment Received! 💰</h2>
      <p style="color: #d4d4d4; font-size: 15px;">Hi ${goalkeeperName},</p>
      <p style="color: #d4d4d4; font-size: 15px;">Great news! The organizer has paid for your match.</p>
      ${matchDetailsBlock(date, location, `<p style="margin: 4px 0; font-size: 14px;"><strong style="color: #a3e635;">💶 Amount:</strong> €${(amount / 100).toFixed(2)}</p>`)}
      <p style="color: #d4d4d4; font-size: 15px;">The match is now <strong style="color: #a3e635;">confirmed</strong>. If you have Stripe Connect set up, the funds will arrive in your bank account within 2-3 business days.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://keepergo.nl/goalkeeper/dashboard" style="display: inline-block; background-color: #a3e635; color: #0a0a0a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">View Match →</a>
      </div>
    `)
    return { subject: `💰 Payment of €${(amount / 100).toFixed(2)} received!`, html }
  },
}

// ---- Convenience Wrappers ----

export async function sendBookingAcceptedEmail(
  organizerEmail: string,
  organizerName: string,
  goalkeeperName: string,
  date: Date,
  location: string
): Promise<boolean> {
  const template = emailTemplates.bookingAccepted(organizerName, goalkeeperName, date, location)
  return sendNotificationEmail({
    recipientEmail: organizerEmail,
    subject: template.subject,
    htmlBody: template.html,
    notificationId: process.env.NOTIF_ID_BOOKING_ACCEPTED || '',
  })
}

export async function sendBookingCancelledEmail(
  recipientEmail: string,
  userName: string,
  role: string,
  date: Date,
  location: string,
  reason?: string
): Promise<boolean> {
  const template = emailTemplates.bookingCancelled(userName, role, date, location, reason)
  return sendNotificationEmail({
    recipientEmail,
    subject: template.subject,
    htmlBody: template.html,
    notificationId: process.env.NOTIF_ID_BOOKING_CANCELLED || '',
  })
}

export async function sendMatchReminderEmail(
  recipientEmail: string,
  userName: string,
  role: string,
  date: Date,
  location: string,
  hoursUntil: number
): Promise<boolean> {
  const template = emailTemplates.matchReminder(userName, role, date, location, hoursUntil)
  return sendNotificationEmail({
    recipientEmail,
    subject: template.subject,
    htmlBody: template.html,
    notificationId: process.env.NOTIF_ID_MATCH_REMINDER || '',
  })
}

export async function sendPaymentReceivedEmail(
  goalkeeperEmail: string,
  goalkeeperName: string,
  amount: number,
  date: Date,
  location: string
): Promise<boolean> {
  const template = emailTemplates.paymentReceived(goalkeeperName, amount, date, location)
  return sendNotificationEmail({
    recipientEmail: goalkeeperEmail,
    subject: template.subject,
    htmlBody: template.html,
    notificationId: process.env.NOTIF_ID_PAYMENT_RECEIVED || '',
  })
}
