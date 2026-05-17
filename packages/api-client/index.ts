import type {
  AuthUser,
  Booking,
  BookingStatus,
  GoalkeeperProfile,
  Notification,
  Rating,
} from '@keepergo/shared-types'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class KeeperGoApiClient {
  private baseUrl: string
  private sessionToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  setSessionToken(token: string) {
    this.sessionToken = token
  }

  clearSessionToken() {
    this.sessionToken = null
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.sessionToken
        ? { Cookie: `next-auth.session-token=${this.sessionToken}` }
        : {}),
      ...(init?.headers as Record<string, string>),
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }))
      throw new ApiError(response.status, body.error ?? response.statusText)
    }

    return response.json()
  }

  // ─── Autenticação ───────────────────────────────────────────────────────────

  async getCsrfToken(): Promise<{ csrfToken: string }> {
    return this.request('/api/auth/csrf')
  }

  /**
   * Login mobile: obtém CSRF token e autentica via NextAuth credentials.
   * Retorna o session token para ser armazenado no SecureStore.
   */
  async signIn(email: string, password: string): Promise<{ sessionToken: string }> {
    const { csrfToken } = await this.getCsrfToken()

    const response = await fetch(`${this.baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        redirect: 'false',
        json: 'true',
      }).toString(),
      redirect: 'manual',
    })

    const setCookie = response.headers.get('set-cookie') ?? ''
    const match = setCookie.match(/next-auth\.session-token=([^;]+)/)

    if (!match) {
      throw new ApiError(401, 'Email ou senha inválidos')
    }

    return { sessionToken: match[1] }
  }

  /**
   * Google OAuth para mobile: exchange o Google idToken por um sessionToken
   */
  async signInWithGoogle(idToken: string): Promise<{ sessionToken: string }> {
    const response = await fetch(`${this.baseUrl}/api/auth/mobile/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: response.statusText }))
      throw new ApiError(response.status, body.error ?? 'Google authentication failed')
    }

    const data = await response.json()
    return { sessionToken: data.sessionToken }
  }

  async signUp(data: {
    email: string
    password: string
    name: string
    role: 'ORGANIZER' | 'GOALKEEPER'
    inviteCode?: string
    referralCode?: string
  }): Promise<{ message: string }> {
    return this.request('/api/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ─── Usuário ─────────────────────────────────────────────────────────────────

  async getProfile(): Promise<AuthUser> {
    return this.request('/api/user/profile')
  }

  async savePushToken(pushToken: string): Promise<void> {
    return this.request('/api/user/push-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    })
  }

  async deletePushToken(): Promise<void> {
    return this.request('/api/user/push-token', { method: 'DELETE' })
  }

  // ─── Goleiros ────────────────────────────────────────────────────────────────

  async searchGoalkeepers(params?: {
    lat?: number
    lng?: number
    radius?: number
    fieldType?: string
    minPrice?: number
    maxPrice?: number
    minRating?: number
    experienceLevel?: string
    city?: string
  }): Promise<GoalkeeperProfile[]> {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    )
    return this.request(`/api/goalkeepers${qs.toString() ? `?${qs}` : ''}`)
  }

  async getGoalkeeperById(id: string): Promise<GoalkeeperProfile> {
    return this.request(`/api/goalkeepers/${id}`)
  }

  async getGoalkeeperProfile(): Promise<GoalkeeperProfile> {
    return this.request('/api/goalkeeper-profile')
  }

  async updateGoalkeeperProfile(data: Partial<GoalkeeperProfile>): Promise<GoalkeeperProfile> {
    return this.request('/api/goalkeeper-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ─── Favoritos ───────────────────────────────────────────────────────────────

  async getFavorites(): Promise<GoalkeeperProfile[]> {
    return this.request('/api/favorites')
  }

  async checkFavorite(goalkeeperId: string): Promise<{ isFavorite: boolean }> {
    return this.request(`/api/favorites/check?goalkeeperId=${goalkeeperId}`)
  }

  async toggleFavorite(goalkeeperId: string): Promise<void> {
    return this.request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ goalkeeperId }),
    })
  }

  // ─── Reservas ────────────────────────────────────────────────────────────────

  async getBookings(status?: BookingStatus): Promise<Booking[]> {
    return this.request(`/api/bookings${status ? `?status=${status}` : ''}`)
  }

  async getAvailableBookings(): Promise<Booking[]> {
    return this.request('/api/bookings/available')
  }

  async createBooking(data: {
    goalkeeperId?: string
    date: string
    duration: number
    location: string
    latitude?: number
    longitude?: number
    fieldType: string
    pricePerHour: number
    specialRequests?: string
    bookingType: 'DIRECT' | 'OPEN'
  }): Promise<Booking> {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async acceptBooking(bookingId: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/accept`, { method: 'POST' })
  }

  async rejectBooking(bookingId: string, reason?: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async confirmBooking(bookingId: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/confirm`, { method: 'POST' })
  }

  async cancelBooking(bookingId: string, reason: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async goalkeeperConfirmBooking(bookingId: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/goalkeeper-confirm`, { method: 'POST' })
  }

  async reportNoShow(bookingId: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/report-noshow`, { method: 'POST' })
  }

  async confirmWithRating(
    bookingId: string,
    rating: { punctuality: number; attitude: number; technicalSkill: number; comment?: string },
  ): Promise<{ booking: Booking; rating: Rating }> {
    return this.request(`/api/bookings/${bookingId}/confirm-with-rating`, {
      method: 'POST',
      body: JSON.stringify(rating),
    })
  }

  // ─── Pagamentos ──────────────────────────────────────────────────────────────

  async createPayment(bookingId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return this.request(`/api/bookings/${bookingId}/create-payment`, { method: 'POST' })
  }

  async confirmPayment(bookingId: string, paymentIntentId: string): Promise<Booking> {
    return this.request(`/api/bookings/${bookingId}/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    })
  }

  // ─── Stripe Connect (Goleiro) ─────────────────────────────────────────────────

  async createStripeAccount(): Promise<{ accountId: string }> {
    return this.request('/api/stripe-connect/create-account', { method: 'POST' })
  }

  async getStripeAccountStatus(): Promise<{
    detailsSubmitted: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
  }> {
    return this.request('/api/stripe-connect/account-status')
  }

  async getStripeAccountLink(returnUrl: string, refreshUrl: string): Promise<{ url: string }> {
    return this.request('/api/stripe-connect/account-link', {
      method: 'POST',
      body: JSON.stringify({ returnUrl, refreshUrl }),
    })
  }

  // ─── Notificações ─────────────────────────────────────────────────────────────

  async getNotifications(): Promise<Notification[]> {
    return this.request('/api/notifications')
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.request('/api/notifications', {
      method: 'PUT',
      body: JSON.stringify({ notificationId }),
    })
  }

  async getNotificationPreferences(): Promise<Record<string, boolean>> {
    return this.request('/api/notifications/preferences')
  }

  async updateNotificationPreferences(prefs: Record<string, boolean>): Promise<void> {
    return this.request('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    })
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  async getOrganizerAnalytics(): Promise<Record<string, unknown>> {
    return this.request('/api/analytics/organizer')
  }

  // ─── Referral ─────────────────────────────────────────────────────────────────

  async getReferral(): Promise<{ code: string; totalReferrals: number; completedReferrals: number }> {
    return this.request('/api/referral')
  }
}

export type { AuthUser, Booking, BookingStatus, GoalkeeperProfile, Notification, Rating }
