# KeeperGo

🌐 **Website**: [keepergo.nl](https://keepergo.nl)

**KeeperGo** is a SaaS platform that connects football organizers with goalkeepers available for hire in the Netherlands. Organizers can find and book a goalkeeper for their upcoming match; goalkeepers can manage their availability, accept bookings, and receive payments.

---

## What the app does

### For Organizers
- **Find a goalkeeper** — Search by location (GPS or city), filter by price, rating, and field type
- **Book directly** — Select date, duration, field type, and location; send a booking request
- **Pay in-app** — Stripe-powered payment after the goalkeeper accepts
- **Track bookings** — Dashboard showing pending, confirmed, and completed matches
- **Notifications** — Real-time alerts for booking status changes
- **Favourite goalkeepers** — Save preferred goalkeepers for quick access

### For Goalkeepers
- **Manage profile** — Set bio, city, hourly rate, experience level, preferred field types, and availability radius
- **Accept or decline bookings** — Review incoming requests and respond
- **Earnings overview** — See completed matches and total earned
- **Stripe Connect** — Receive payouts directly to a bank account
- **Push notifications** — Get notified of new booking requests instantly

### Authentication
- Email & password login
- Google Sign-In (iOS and Android)
- Secure token storage (iOS Keychain / Android Keystore via Expo SecureStore)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (Expo SDK 52) + Expo Router v4 |
| Web app | Next.js 14 (App Router) |
| Backend API | NestJS + Prisma + PostgreSQL |
| Authentication | JWT Bearer tokens (NestJS) |
| Payments | Stripe (Payment Intents + Stripe Connect) |
| Push notifications | Expo Push Notifications |
| State management | Zustand + TanStack Query |
| Monorepo | Turborepo + Yarn Workspaces |
| Build & distribution | EAS Build (Expo Application Services) |

---

## Project Structure

```
keepergo/
├── apps/
│   ├── mobile/          # React Native app (iOS & Android)
│   │   ├── app/         # Expo Router screens
│   │   │   ├── (auth)/      # Login, register
│   │   │   ├── (organizer)/ # Organizer dashboard, search, booking, payment
│   │   │   └── (goalkeeper)/ # Goalkeeper dashboard, profile, bank setup
│   │   └── lib/         # API client, auth store
│   └── web/             # Next.js web app
│       └── app/         # App Router pages
├── packages/
│   └── api-client/      # Shared API client (web)
└── turbo.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Yarn 4
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Install dependencies
```bash
yarn install
```

### Run the mobile app (development)
```bash
cd apps/mobile
npx expo start
```

### Run the web app
```bash
cd apps/web
npm run dev
```

### Build for iOS (preview)
```bash
cd apps/mobile
npx eas build --platform ios --profile preview
```

---

## Environment Variables

Create `apps/mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://keepergo-api.abacusai.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<your-web-client-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<your-ios-client-id>
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
```

---

## API

The backend API is hosted at `https://keepergo-api.abacusai.app` and built with NestJS. Key endpoints:

- `POST /auth/login` — Email/password login
- `POST /auth/register` — New user registration
- `POST /auth/google/mobile` — Google Sign-In (mobile)
- `GET /users/me` — Get authenticated user profile
- `GET /goalkeepers` — Search goalkeepers
- `POST /bookings` — Create a booking
- `PATCH /bookings/:id/accept` — Accept a booking (goalkeeper)
- `POST /payments/create-intent` — Create Stripe payment intent

---

## License

Private project — all rights reserved.
