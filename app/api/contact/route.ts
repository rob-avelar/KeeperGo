import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, message } = data

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create HTML email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 10px 0;"><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #7c3aed;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #666; font-size: 12px;">
          Submitted at: ${new Date().toLocaleString('en-NL', { timeZone: 'Europe/Amsterdam' })}
        </p>
      </div>
    `

    // Extract app name from NEXTAUTH_URL for sender alias
    const appUrl = process.env.NEXTAUTH_URL || ''
    let senderEmail = 'noreply@mail.abacusai.app'
    let appName = 'KeeperGo'
    
    try {
      if (appUrl) {
        const hostname = new URL(appUrl).hostname
        senderEmail = `noreply@${hostname}`
        appName = 'KeeperGo'
      }
    } catch (e) {
      // Use defaults if URL parsing fails
    }

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_CONTACT_FORM_SUBMISSION,
        subject: `[KeeperGo] New message from ${name}`,
        body: htmlBody,
        is_html: true,
        recipient_email: 'contact@keepergo.nl',
        sender_email: senderEmail,
        sender_alias: appName,
      }),
    })

    const result = await response.json()
    
    if (!result.success) {
      // Check if notification was disabled by user
      if (result.notification_disabled) {
        console.log('Notification disabled by user, skipping email')
        return NextResponse.json({ success: true, message: 'Form submitted (notification disabled)' })
      }
      throw new Error(result.message || 'Failed to send notification')
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Error sending contact form:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}
