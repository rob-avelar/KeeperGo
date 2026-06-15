# Sentry Setup - Error Monitoring

## Overview
Sentry tracks errors in production for both web and mobile apps.

## Setup Steps

### 1. Create Sentry Account
1. Go to https://sentry.io/signup/
2. Sign up with your email
3. Create organization "KeeperGo"
4. Create projects:
   - **Web App** (Next.js)
   - **Mobile App** (React Native)

### 2. Get DSN Keys
Each project will have a **DSN** (Data Source Name). Copy them for later.

Example: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

### 3. Install Sentry in Web App

```bash
cd apps/web
npm install @sentry/nextjs
```

Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_SENTRY_DSN=YOUR_WEB_DSN_HERE
```

Create `apps/web/sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

Create `apps/web/sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Backend DSN (different from public)
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

Update `apps/web/next.config.js`:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const config = {
  // ... existing config
};

module.exports = withSentryConfig(config, {
  org: "keepergo",
  project: "web",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourcemaps: true,
});
```

### 4. Install Sentry in Mobile App

```bash
cd apps/mobile
npx expo install @sentry/react-native @sentry/cli
```

Add to `apps/mobile/.env`:
```
EXPO_PUBLIC_SENTRY_DSN=YOUR_MOBILE_DSN_HERE
```

Update `apps/mobile/app/_layout.tsx`:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export default function RootLayout() {
  return (
    // ... existing layout
  );
}
```

### 5. Test Integration

**Web:**
```typescript
// In any Next.js route
import * as Sentry from "@sentry/nextjs";

try {
  throw new Error("Test error");
} catch (error) {
  Sentry.captureException(error);
}
```

**Mobile:**
```typescript
// In any React Native component
import * as Sentry from '@sentry/react-native';

try {
  throw new Error("Test error");
} catch (error) {
  Sentry.captureException(error);
}
```

### 6. Production Environment Variables

Add to CI/CD (GitHub Actions or deployment):
```
SENTRY_DSN (backend)
NEXT_PUBLIC_SENTRY_DSN (frontend)
SENTRY_AUTH_TOKEN (for sourcemap upload)
```

## Monitoring Features

Once enabled, Sentry will track:
- ✅ Unhandled exceptions
- ✅ API errors
- ✅ Performance issues
- ✅ User sessions (crashes)
- ✅ Release tracking
- ✅ Source maps (for debugging)

## Cost

- **Free tier**: 5k errors/month + 10 sessions/month (enough for MVP)
- **Paid**: From $99/month

For MVP launch, free tier is fine. Upgrade when needed.

## References

- Sentry Docs: https://docs.sentry.io/
- Next.js Integration: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- React Native Integration: https://docs.sentry.io/platforms/react-native/
