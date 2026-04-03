// Roles e status espelhando os enums do Prisma
export type UserRole = 'ORGANIZER' | 'GOALKEEPER' | 'ADMIN'

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'AWAITING_CONFIRMATION'
  | 'NO_SHOW'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'RATING_RECEIVED'
  | 'SYSTEM'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  image?: string | null
}

export interface GoalkeeperProfile {
  id: string
  userId: string
  age?: number | null
  bio?: string | null
  experienceLevel?: string | null
  preferredFields: string[]
  serviceRadius: number
  hourlyRateMin: number
  hourlyRateMax: number
  profilePhotoPath?: string | null
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  averageRating: number
  totalMatches: number
  isActive: boolean
  stripeAccountStatus?: string | null
  stripeChargesEnabled: boolean
  stripePayoutsEnabled: boolean
  user?: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export interface Booking {
  id: string
  organizerId: string
  goalkeeperId?: string | null
  date: string
  duration: number
  location: string
  latitude?: number | null
  longitude?: number | null
  fieldType: string
  pricePerHour: number
  totalAmount: number
  platformFee: number
  goalkeeperEarnings: number
  status: BookingStatus
  specialRequests?: string | null
  cancellationReason?: string | null
  createdAt: string
  updatedAt: string
  organizer: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  goalkeeper?: {
    id: string
    name: string
    email: string
    image?: string | null
  } | null
}

export interface Notification {
  id: string
  userId: string
  bookingId?: string | null
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export interface Rating {
  id: string
  bookingId: string
  raterId: string
  ratedId: string
  punctuality: number
  attitude: number
  technicalSkill: number
  comment?: string | null
  createdAt: string
}

export interface ApiError {
  error: string
  details?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
