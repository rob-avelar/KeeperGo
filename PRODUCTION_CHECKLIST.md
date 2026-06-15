# Production Deployment Checklist

## Database Setup (Critical)

### 1. Apply Prisma Migrations to Production

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://role_1a8c4c506:p9WsK_tO9a4R3aLTB6BqfqKQmhWPqjgY@db-1a8c4c506.db003.hosteddb.reai.io:5432/1a8c4c506?sslmode=prefer"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db push --skip-generate
```

This will:
- ✅ Create all tables (Users, Bookings, Payments, etc.)
- ✅ Setup relationships and constraints
- ✅ Create enums for status types

### 2. (Optional) Seed Test Data

```bash
cd apps/web
npx ts-node --require dotenv/config scripts/seed.ts
```

---

## Web App Deployment (Vercel)

### 1. Connect Repository
1. Go to https://vercel.com
2. Connect your GitHub account
3. Import repo `rob-avelar/KeeperGo`
4. Select `apps/web` as root directory

### 2. Configure Environment Variables
Add to Vercel project settings:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<your-generated-secret-here>
NEXTAUTH_URL=https://www.keepergo.nl
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
STRIPE_SECRET_KEY=sk_live_<your-stripe-live-key>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-stripe-live-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>
AWS_S3_BUCKET=<your-bucket-name>
AWS_REGION=us-west-2
AWS_FOLDER_PREFIX=<your-folder-prefix>
```

**Note**: See `.env.example` files in each app for exact variable names and format.

### 3. Deploy
- Manual: Click "Deploy" button
- Automatic: Push to main branch (GitHub Actions triggers)

---

## Mobile App - App Store Submission (iOS)

### Prerequisites
- ✅ Apple Developer Account ($99/year)
- ✅ Distribution Certificate (you have it - valid until 2027/04/04)
- ✅ Ad Hoc Provisioning Profile (you have it)

### Steps

1. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Click "Apps" → "+" → "New App"
   - Bundle ID: `nl.keepergo.app`
   - Name: `KeeperGo`
   - Primary Language: English
   - Category: Sports

2. **Build Production IPA**
   
   Option A: **On Mac (Recommended)**
   ```bash
   cd apps/mobile
   eas build --platform ios --profile production --local
   ```

   Option B: **Xcode Cloud** (Apple's CI/CD)
   - More expensive but doesn't need Mac
   - Setup at https://developer.apple.com/xcode/cloud/

3. **TestFlight Beta Testing** (Recommended)
   - Upload IPA to TestFlight
   - Test with real users (you and friends)
   - 14 days minimum before App Store review

4. **Submit for Review**
   - Fill app information (screenshots, description)
   - Set price and availability
   - Submit for review (~24-48 hours review time)

### App Store Review Guidelines

Make sure to:
- ✅ Privacy policy clearly linked
- ✅ Age rating (4+)
- ✅ Screenshots showing main features
- ✅ Description explains what it does
- ✅ Test on actual device before submission

**Common Rejection Reasons:**
- ❌ Broken links in privacy/terms
- ❌ Missing privacy disclosures
- ❌ Payment processing not clear
- ❌ Crashes on launch

---

## Mobile App - Google Play Submission (Android)

### Prerequisites
- ✅ Google Play Developer Account ($25 one-time)
- ✅ Android App Bundle (AAB) - Already built!

### Steps

1. **Setup Google Play Console**
   - Go to https://play.google.com/console
   - Create new app
   - App name: `KeeperGo`
   - Default language: English

2. **Upload App Bundle**
   - Go to "Releases" → "Production"
   - Click "Create new release"
   - Upload the AAB file:
     ```
     https://expo.dev/artifacts/eas/jHNoBYcVMrgkeGgw1jV2K9.aab
     ```

3. **Fill App Details**
   - App title: KeeperGo
   - Short description: Find the perfect goalkeeper for your match
   - Full description: [see app store listing]
   - Screenshots (5-8, min 320x1280px)
   - Feature image (1024x500px)
   - Category: Sports
   - Content rating: Fill questionnaire

4. **Set Pricing & Distribution**
   - Price: Free
   - Countries: All (or select)
   - Content rating age: 3+ (IARC)

5. **Review & Release**
   - Google usually reviews in 2-3 hours
   - Then available in Play Store immediately

### Required Screenshots/Assets

For both stores you need:
- **Phone screenshots**: 5-8 screenshots showing key features
- **Feature image**: Large promotional image (1024x500px for Android, 1280x720px for iOS)
- **App icon**: 512x512px
- **Privacy policy link**: Must be working
- **Terms of service link**: Must be working

---

## Post-Launch Monitoring

### 1. Setup Monitoring
- [ ] Sentry (error tracking) - see SENTRY_SETUP.md
- [ ] Google Analytics (web)
- [ ] Firebase Analytics (mobile)
- [ ] Stripe Dashboard (payments)

### 2. Health Checks
Daily after launch:
- [ ] Check app crashes in Sentry
- [ ] Verify payment processing in Stripe
- [ ] Check API response times
- [ ] Monitor database performance

### 3. User Support
- [ ] Setup email support (contact@keepergo.nl)
- [ ] Monitor App Store reviews
- [ ] Add in-app bug reporting

---

## Timeline Estimate

| Task | Time | Critical |
|------|------|----------|
| Database migrations | 30 min | ✅ |
| Vercel web deployment | 1 hour | ✅ |
| iOS App Store setup | 2-3 hours | ✅ |
| iOS TestFlight testing | 1-2 days | ⚠️ |
| iOS submit review | 24-48 hours | ✅ |
| Android Play Store setup | 1 hour | ✅ |
| Android submit review | 2-3 hours | ✅ |
| **Total to Live** | **2-4 days** | |

---

## Rollback Plan

If something breaks in production:

1. **Web App**: Revert deployment in Vercel (1 click)
2. **Database**: Keep backup before migration
3. **Mobile**: Can always release new version
4. **Stripe**: No rollback needed (records are immutable)

---

## Post-Launch Tasks

Once live:
- [ ] Monitor crash reports (Sentry)
- [ ] Collect user feedback
- [ ] Plan feature v1.1 (ratings, in-app chat, etc.)
- [ ] Setup customer support
- [ ] Promote in social media / Dutch soccer communities

---

Good luck! 🚀
