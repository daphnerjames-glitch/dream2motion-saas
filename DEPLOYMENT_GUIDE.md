# Dream2Motion.ai - Deployment Guide

## Overview
Dream2Motion.ai is a SaaS platform for AI video generation with:
- React frontend (Vercel)
- Node.js backend (Google Cloud Run)
- Supabase database
- Stripe payments
- YouTube OAuth integration

## Prerequisites
- GitHub account
- Google Cloud account
- Supabase account
- Stripe account (already set up)
- YouTube OAuth credentials (already created)

## Step 1: Setup Supabase Database

1. Go to https://supabase.com and create a new project
2. In the SQL editor, run the contents of `dream2motion-database/schema.sql`
3. Copy your **Project URL** and **anon key** from Settings
4. Store these - you'll need them in .env

## Step 2: Setup Environment Variables

### Backend (.env file in dream2motion-backend/)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=generate-random-string-here
STRIPE_SECRET_KEY=sk_test_51TY4wG6cFYGgfZEUQnQ2jhHnZJw1N1IJjOinyJbXOdpxcrQl96e6wn5ONegV6MX9VtxPTFrjvY5j2dIx880FHwoY00Pq9cF4Q6
YOUTUBE_CLIENT_ID=260985892935-aj4n47o62i9jdansrn7u2m6rlq26cho5.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-yKpnSEyD5uDJk-rA3kCJ_XcQFUD
YOUTUBE_REDIRECT_URI=https://dream2motion.ai/auth/youtube/callback
SEEDANCE_API_KEY=get-from-seedance
MUBERT_API_KEY=get-from-mubert
PORT=3001
```

### Frontend (.env.local in dream2motion-frontend/)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=260985892935-aj4n47o62i9jdansrn7u2m6rlq26cho5.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TY4wG6cFYGgfZEUrf4UCcp8jowzQgrVEmuGircr9VP4S3EsYT8V7i4Y8VosHlvBDQXKbotuaTElmmbfjmddJabg00hteo8EIe
```

## Step 3: Deploy Backend to Google Cloud Run

1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project autonomous-income-engine`
4. Deploy:
   ```
   gcloud run deploy dream2motion-backend \
     --source=dream2motion-backend \
     --region=us-central1 \
     --platform=managed \
     --set-env-vars=SUPABASE_URL=your-url,SUPABASE_KEY=your-key,JWT_SECRET=your-secret,STRIPE_SECRET_KEY=sk_...,YOUTUBE_CLIENT_ID=260985892935...,YOUTUBE_CLIENT_SECRET=GOCSPX...,SEEDANCE_API_KEY=...,MUBERT_API_KEY=...
   ```
5. Copy the service URL - you'll use it in frontend env

## Step 4: Deploy Frontend to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. From `dream2motion-frontend/`:
   ```
   vercel
   ```
3. Follow the prompts to connect to your GitHub repo
4. Add environment variables in Vercel dashboard
5. Vercel automatically deploys on each push

## Step 5: Setup GitHub

1. Create a new GitHub repository (dream2motion-saas)
2. Push code:
   ```
   git init
   git add .
   git commit -m "Initial Dream2Motion.ai setup"
   git remote add origin https://github.com/yourusername/dream2motion-saas.git
   git push -u origin main
   ```

## Step 6: Configure YouTube OAuth Callback

1. Go to Google Cloud Console → OAuth 2.0 credentials
2. Update your YouTube OAuth client:
   - Add authorized redirect URI: `https://dream2motion.ai/auth/youtube/callback`
3. (Once you have a domain, update this to your actual domain)

## Step 7: Test Everything

1. Frontend: `npm run dev` (http://localhost:3000)
2. Backend: `npm run dev` (http://localhost:3001)
3. Create an account
4. Create a video project
5. Test generation

## Stripe Webhook Setup (Optional)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend-url.run.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret for .env

## Domain Setup (When Ready)

1. Buy domain (e.g., dream2motion.ai)
2. Point DNS to Vercel nameservers (for frontend)
3. Update YouTube OAuth redirect URI
4. Update backend Cloud Run custom domain

## Monitoring

- **Frontend**: Vercel Analytics dashboard
- **Backend**: Google Cloud Run logs
- **Database**: Supabase dashboard
- **Payments**: Stripe dashboard

## Troubleshooting

### Backend not connecting to Supabase
- Check SUPABASE_URL and SUPABASE_KEY in env
- Verify database tables were created
- Check Cloud Run logs: `gcloud run logs dream2motion-backend --limit 50`

### Frontend not loading
- Check NEXT_PUBLIC_API_URL points to correct backend
- Check environment variables in Vercel dashboard
- Vercel build logs: https://vercel.com/dashboard

### YouTube OAuth not working
- Verify redirect URI is correct
- Check Client ID/Secret match what's in .env
- Verify user is in test users list (if app is in development)
