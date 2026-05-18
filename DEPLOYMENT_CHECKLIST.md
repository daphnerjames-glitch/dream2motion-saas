# Dream2Motion.ai - Deployment Checklist

## Phase 1: Preparation (Do This First)

- [ ] **Database Setup** - Follow `SUPABASE_SETUP.md`
  - Run schema.sql in Supabase
  - Copy Project URL and Anon Key
  - Add to backend .env

- [ ] **Get API Keys** - Follow `GET_API_KEYS.md`
  - Sign up for Seedance, copy API key
  - Sign up for Mubert, copy API key
  - Add both to backend .env

- [ ] **Verify Backend .env** - Check `dream2motion-backend/.env` has all 8 required values:
  - SUPABASE_URL
  - SUPABASE_KEY
  - JWT_SECRET
  - STRIPE_SECRET_KEY
  - YOUTUBE_CLIENT_ID
  - YOUTUBE_CLIENT_SECRET
  - SEEDANCE_API_KEY
  - MUBERT_API_KEY

- [ ] **Create GitHub Repo**
  ```
  cd C:\Users\daphn\Desktop\Brain
  git init
  git add .
  git commit -m "Initial Dream2Motion.ai setup"
  git remote add origin https://github.com/YOUR_USERNAME/dream2motion-saas.git
  git push -u origin main
  ```

## Phase 2: Deploy Backend (Google Cloud Run)

- [ ] Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
- [ ] Authenticate: `gcloud auth login`
- [ ] Set project: `gcloud config set project autonomous-income-engine`
- [ ] Deploy:
  ```
  gcloud run deploy dream2motion-backend \
    --source=dream2motion-backend \
    --region=us-central1 \
    --platform=managed \
    --set-env-vars=SUPABASE_URL=https://xxxxx.supabase.co,SUPABASE_KEY=eyJ...,JWT_SECRET=random,STRIPE_SECRET_KEY=sk_...,YOUTUBE_CLIENT_ID=260985892935...,YOUTUBE_CLIENT_SECRET=GOCSPX...,SEEDANCE_API_KEY=...,MUBERT_API_KEY=...
  ```
- [ ] Copy service URL (shows at end, looks like `https://dream2motion-xyz.run.app`)

## Phase 3: Deploy Frontend (Vercel)

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] From `dream2motion-frontend/` directory, run: `vercel`
- [ ] Follow prompts to connect GitHub repo
- [ ] In Vercel Dashboard, add environment variables:
  - `NEXT_PUBLIC_API_URL` = your backend service URL from Phase 2
  - `NEXT_PUBLIC_YOUTUBE_CLIENT_ID` = 260985892935-aj4n47o62i9jdansrn7u2m6rlq26cho5.apps.googleusercontent.com
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_51TY4wG6cFYGgfZEUrf4UCcp8jowzQgrVEmuGircr9VP4S3EsYT8V7i4Y8VosHlvBDQXKbotuaTElmmbfjmddJabg00hteo8EIe
- [ ] Vercel auto-deploys

## Phase 4: Test (Local)

Before going live, test locally:

```bash
# Terminal 1 - Backend
cd dream2motion-backend
npm install
npm run dev
# Should run on http://localhost:3001

# Terminal 2 - Frontend
cd dream2motion-frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
# Should run on http://localhost:3000
```

- [ ] Visit http://localhost:3000
- [ ] Sign up with test account
- [ ] Create a video project
- [ ] Test form submission

## Phase 5: Optional Enhancements

- [ ] **Stripe Webhook** - Setup in Stripe Dashboard
  - Endpoint: `https://your-backend.run.app/api/webhooks/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

- [ ] **Domain Setup** - When ready:
  - Buy domain (e.g., dream2motion.ai)
  - Point to Vercel nameservers
  - Update YouTube OAuth redirect URI
  - Update backend Cloud Run custom domain

- [ ] **Monitoring**
  - Frontend: Vercel Analytics
  - Backend: `gcloud run logs dream2motion-backend`
  - Database: Supabase Dashboard

---

**Current Status:**
- Schema fixed ✅
- Code ready ✅
- API keys needed ⏳
- GitHub repo needed ⏳
- Deployments pending ⏳

**Next Action:** Get Seedance & Mubert API keys, then start Phase 1.
