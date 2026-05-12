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
  private accessToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  setSessionToken(token: string) {
    this.accessToken = token
  }

  clearSessionToken() {
    this.accessToken = null
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : {}),
      ...(init?.headers as Record<string, string>),
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: response.statusText }))
      throw new ApiError(response.status, body.message ?? body.error ?? response.statusText)
    }

    const json = await response.json()
    return (json.data ?? json) as T
  }

  // ─── Autenticação ───────────────────────────────────────────────────────────

  async signIn(email: string, password: string): Promise<{ sessionToken: string }> {
    const data = await this.request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return { sessionToken: data.accessToken }
  }

  async signInWithGoogle(idToken: string): Promise<{ sessionToken: string }> {
    const data = await this.request<{ accessToken: string }>('/auth/google/mobile', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })
    return { sessionToken: data.accessToken }
  }

  async signUp(data: {
    email: string
    password: string
    name: string
    role: 'ORGANIZER' | 'GOALKEEPER'
    inviteCode?: string
    referralCode?: string
  }): Promise<{ message: string }> {
    await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { message: 'Registered successfully' }
  }

  // ─── Usuário ─────────────────────────────────────────────────────────────────

  async getProfile(): Promise<AuthUser> {
    const result = await this.request<AuthUser | { user: AuthUser }>('/users/me')
    if (result && 'user' in result && result.user) return result.user
    return result as AuthUser
  }

  async savePushToken(pushToken: string): Promise<void> {
    return this.request('/users/push-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    })
  }

  async deletePushToken(): Promise<void> {
    return this.request('/users/push-token', { method: 'DELETE' })
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
    const result = await this.request<{ items: GoalkeeperProfile[] } | GoalkeeperProfile[]>(
      `/goalkeepers${qs.toString() ? `?${qs}` : ''}`,
    )
    return Array.isArray(result) ? result : (result as { items: GoalkeeperProfile[] }).items ?? []
  }

  async getGoalkeeperById(id: string): Promise<GoalkeeperProfile> {
    return this.request(`/goalkeepers/${id}`)
  }

  async getGoalkeeperProfile(): Promise<GoalkeeperProfile> {
    return this.request('/goalkeepers/profile')
  }

  async updateGoalkeeperProfile(data: Partial<GoalkeeperProfile>): Promise<GoalkeeperProfile> {
    return this.request('/goalkeepers/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // ─── Favoritos ───────────────────────────────────────────────────────────────

  async getFavorites(): Promise<GoalkeeperProfile[]> {
    const result = await this.request<{ items: GoalkeeperProfile[] } | GoalkeeperProfile[]>('/favorites')
    return Array.isArray(result) ? result : (result as { items: GoalkeeperProfile[] }).items ?? []
  }

  async checkFavorite(goalkeeperId: string): Promise<{ isFavorite: boolean }> {
    return this.request(`/favorites/check?goalkeeperId=${goalkeeperId}`)
  }

  async toggleFavorite(goalkeeperId: string): Promise<void> {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ goalkeeperId }),
    })
  }

  // ─── Reservas ────────────────────────────────────────────────────────────────

  async getBookings(status?: BookingStatus): Promise<Booking[]> {
    const result = await this.request<{ items: Booking[] } | Booking[]>(
      `/bookings${status ? `?status=${status}` : ''}`,
    )
    return Array.isArray(result) ? result : (result as { items: Booking[] }).items ?? []
  }

  async getAvailableBookings(): Promise<Booking[]> {
    const result = await this.request<{ items: Booking[] } | Booking[]>('/bookings/available')
    return Array.isArray(result) ? result : (result as { items: Booking[] }).items ?? []
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
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async acceptBooking(bookingId: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/accept`, { method: 'PATCH' })
  }

  async rejectBooking(bookingId: string, reason?: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  }

  async confirmBooking(bookingId: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/confirm`, { method: 'PATCH' })
  }

  async cancelBooking(bookingId: string, reason: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  }

  async goalkeeperConfirmBooking(bookingId: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/goalkeeper-confirm`, { method: 'PATCH' })
  }

  async reportNoShow(bookingId: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/report-noshow`, { method: 'PATCH' })
  }

  async confirmWithRating(
    bookingId: string,
    rating: { punctuality: number; attitude: number; technicalSkill: number; comment?: string },
  ): Promise<{ booking: Booking; rating: Rating }> {
    return this.request(`/bookings/${bookingId}/confirm-with-rating`, {
      method: 'PATCH',
      body: JSON.stringify(rating),
    })
  }

  // ─── Pagamentos ──────────────────────────────────────────────────────────────

  async createPayment(bookingId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    })
  }

  async confirmPayment(bookingId: string, paymentIntentId: string): Promise<Booking> {
    return this.request(`/bookings/${bookingId}/confirm-payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentIntentId }),
    })
  }

  // ─── Stripe Connect (Goleiro) ─────────────────────────────────────────────────

  async createStripeAccount(): Promise<{ accountId: string }> {
    return this.request('/payments/stripe-connect/create-account', { method: 'POST' })
  }

  async getStripeAccountStatus(): Promise<{
    detailsSubmitted: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
  }> {
    return this.request('/payments/stripe-connect/account-status')
  }

  async getStripeAccountLink(returnUrl: string, refreshUrl: string): Promise<{ url: string }> {
    return this.request('/payments/stripe-connect/account-link', {
      method: 'POST',
      body: JSON.stringify({ returnUrl, refreshUrl }),
    })
  }

  // ─── Notificações ─────────────────────────────────────────────────────────────

  async getNotifications(): Promise<Notification[]> {
    const result = await this.request<{ items: Notification[] } | Notification[]>('/notifications')
    return Array.isArray(result) ? result : (result as { items: Notification[] }).items ?? []
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PATCH' })
  }

  async getNotificationPreferences(): Promise<Record<string, boolean>> {
    return this.request('/users/notification-preferences')
  }

  async updateNotificationPreferences(prefs: Record<string, boolean>): Promise<void> {
    return this.request('/users/notification-preferences', {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    })
  }

  // ─── Analytics ───────────────────────────────────────────────────────────────

  async getOrganizerAnalytics(): Promise<Record<string, unknown>> {
    return this.request('/analytics/organizer')
  }

  // ─── Referral ─────────────────────────────────────────────────────────────────

  async getReferral(): Promise<{ code: string; totalReferrals: number; completedReferrals: number }> {
    return this.request('/referrals/code')
  }
}

export type { AuthUser, Booking, BookingStatus, GoalkeeperProfile, Notification, Rating }
