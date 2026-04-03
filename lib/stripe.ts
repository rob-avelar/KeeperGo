
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

// Helper function to create a Stripe Connect Express account
export async function createConnectAccount(email: string, country: string = 'NL') {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: country,
      email: email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual', // Most goalkeepers are individuals
    })
    
    return account
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    throw error
  }
}

// Helper function to create an account link for onboarding
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })
    
    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}

// Helper function to retrieve account status
export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    
    return {
      id: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
    }
  } catch (error) {
    console.error('Error retrieving account status:', error)
    throw error
  }
}

// Helper function to create a login link for Express Dashboard
export async function createLoginLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId)
    return loginLink
  } catch (error) {
    console.error('Error creating login link:', error)
    throw error
  }
}

// Helper function to create a transfer to a connected account
export async function createTransfer(
  amount: number, // in cents
  destinationAccountId: string,
  transferGroup: string, // booking ID
  metadata?: Record<string, string>
) {
  try {
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: 'eur',
      destination: destinationAccountId,
      transfer_group: transferGroup,
      metadata: metadata || {},
    })
    
    return transfer
  } catch (error) {
    console.error('Error creating transfer:', error)
    throw error
  }
}

// Helper function to create a PaymentIntent with destination charge for a booking
export async function createPaymentIntentForBooking(
  amount: number, // total amount in cents
  bookingId: string,
  goalkeeperStripeAccountId?: string | null
) {
  const applicationFee = Math.floor(amount * 0.25) // 25% platform fee

  const params: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
    metadata: {
      bookingId,
      type: 'booking_payment',
    },
  }

  // If goalkeeper has Stripe Connect account, use destination charge
  if (goalkeeperStripeAccountId) {
    params.transfer_data = {
      destination: goalkeeperStripeAccountId,
    }
    params.application_fee_amount = applicationFee
  }

  return stripe.paymentIntents.create(params)
}

// Helper to retrieve a PaymentIntent
export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

// Helper to construct webhook event
export function constructWebhookEvent(body: string, signature: string, secret: string) {
  return stripe.webhooks.constructEvent(body, signature, secret)
}
