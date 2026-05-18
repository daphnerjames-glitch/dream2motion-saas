# Replicate Setup - Dream2Motion.ai

You've signed up for Replicate. Now set it up:

## Step 1: Add Payment Method

1. Go to https://replicate.com/account/billing
2. Add your credit card
3. This is for billing when users generate videos

## Step 2: Get Your API Key

1. Go to https://replicate.com/account
2. Click "API Tokens"
3. Copy your token (starts with `r8_`)

## Step 3: Update Backend .env

In `dream2motion-backend/.env`, add:

```
REPLICATE_API_KEY=r8_your_token_here
```

Replace with your actual token.

## Step 4: Verify Other .env Values

Your `dream2motion-backend/.env` should now have:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...
JWT_SECRET=random-string
STRIPE_SECRET_KEY=sk_test_...
YOUTUBE_CLIENT_ID=260985892935-aj4n47o62i9jdansrn7u2m6rlq26cho5.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-yKpnSEyD5uDJk-rA3kCJ_XcQFUD
YOUTUBE_REDIRECT_URI=https://dream2motion.ai/auth/youtube/callback
REPLICATE_API_KEY=r8_your_token_here
PORT=3001
```

## Done

Backend is now configured to use Replicate for:
- ✅ Video generation (Flux Pro)
- ✅ Music generation (MusicGen)
- ✅ Sound effects

Ready to deploy!
