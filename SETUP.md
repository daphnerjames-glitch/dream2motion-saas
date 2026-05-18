# Dream2Motion SaaS - Setup Guide

## Environment Variables Required

Add these to Vercel project settings under Environment Variables:

```
MONGODB_URI=<your mongodb connection string>
JWT_SECRET=<your jwt secret key>
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
REPLICATE_API_TOKEN=<your replicate api token>
GEMINI_API_KEY=<your google gemini api key>
NEXT_PUBLIC_API_URL=https://dream2motion-saas.vercel.app/api
```

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your Secret Key from Dashboard → Developers → API Keys
3. Set up webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://dream2motion-saas.vercel.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `invoice.payment_succeeded`
   - Copy the Signing secret and add as `STRIPE_WEBHOOK_SECRET`

## API Endpoints

### Public
- `GET /api/granny/episodes` - Fetch Granny episodes from Google Sheet

### Protected (require Bearer token)
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/user/profile` - Get user profile
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/videos/generate-with-replicate` - Generate video with AI
- `GET /api/videos/status?videoId=ID` - Check video generation status
- `GET /api/videos/list` - Get user's videos
- `POST /api/test/generate-granny` - TEST: Generate Granny episode

## Pricing Plans

- **Starter**: $9/month → 5 videos/month (1 credit per short video)
- **Pro**: $29/month → 20 videos/month (3 credits per medium video)
- **Studio**: $79/month → Unlimited videos (8 credits per long video)

## Video Generation Flow

1. User signs up/logs in
2. User buys credits via Stripe
3. Stripe webhook adds credits to user account
4. User creates video via form
5. API checks credits, calls Gemini for script, Replicate for video
6. Credits deducted from user account
7. Dashboard polls /api/videos/status every 10 seconds
8. When video is ready, URL is displayed in dashboard

## Testing

Generate a test Granny episode:
```bash
curl -X POST https://dream2motion-saas.vercel.app/api/test/generate-granny \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Architecture

```
Client (Next.js)
  ↓
Dashboard (shows videos, credit balance)
Create Video Form (title, description, style, duration)
  ↓
API Endpoints
  ↓
Stripe (payment processing)
Google Gemini (script generation)
Replicate (AI video generation)
  ↓
MongoDB (store users, videos, payments)
```

## Files Created/Updated

### API Endpoints
- `pages/api/stripe/create-checkout.js` - Stripe checkout session
- `pages/api/webhooks/stripe.js` - Stripe webhook handler
- `pages/api/videos/generate-with-replicate.js` - Video generation pipeline
- `pages/api/videos/status.js` - Video status polling
- `pages/api/test/generate-granny.js` - Test Granny generation

### Frontend
- `pages/create-video.jsx` - Video creation form with credit check
- `pages/dashboard.jsx` - Dashboard with real-time video polling
- `pages/granny.jsx` - Granny episodes dashboard

### Configuration
- `.env.local` - Local environment variables (Vercel has production ones)
