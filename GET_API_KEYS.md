# Getting Required API Keys - Dream2Motion.ai

You have:
- ✅ YouTube OAuth (configured)
- ✅ Stripe (configured)
- ❌ Seedance API Key (NEEDED)
- ❌ Mubert API Key (NEEDED)

## Get Seedance API Key

1. Go to https://api.seedance.ai
2. Sign up for account
3. Go to **API Keys** or **Developer Settings**
4. Create a new API key
5. Copy it to `dream2motion-backend/.env`:
   ```
   SEEDANCE_API_KEY=your-key-here
   ```

## Get Mubert API Key

1. Go to https://www.mubert.com/developer
2. Sign up or log in
3. Create API application
4. Copy API key
5. Copy to `dream2motion-backend/.env`:
   ```
   MUBERT_API_KEY=your-key-here
   ```

## Verify Your Backend .env

After getting both keys, your `dream2motion-backend/.env` should have:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...
JWT_SECRET=any-random-string
STRIPE_SECRET_KEY=sk_test_51TY4wG6cFYGgfZEUQnQ2jhHnZJw1N1IJjOinyJbXOdpxcrQl96e6wn5ONegV6MX9VtxPTFrjvY5j2dIx880FHwoY00Pq9cF4Q6
YOUTUBE_CLIENT_ID=260985892935-aj4n47o62i9jdansrn7u2m6rlq26cho5.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-yKpnSEyD5uDJk-rA3kCJ_XcQFUD
YOUTUBE_REDIRECT_URI=https://dream2motion.ai/auth/youtube/callback
SEEDANCE_API_KEY=your-seedance-key
MUBERT_API_KEY=your-mubert-key
PORT=3001
```

Once you have all keys, you're ready to deploy.
