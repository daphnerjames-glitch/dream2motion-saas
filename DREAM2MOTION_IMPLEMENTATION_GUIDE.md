# Dream2Motion.ai SaaS - Complete Implementation Guide

**Last Updated:** May 17, 2026  
**Status:** In Development  
**Current Stage:** Frontend deployed, MongoDB configured, backend integration pending

---

## 📋 PROJECT OVERVIEW

Dream2Motion.ai is a **Video Generation SaaS** that converts text, images, or sketches into AI-powered animated videos. Users can generate videos with different animation styles, durations, and effects through a web dashboard.

**Core Purpose:** Allow users to create professional videos instantly without complex video editing skills.

---

## ✅ COMPLETED WORK

### 1. Frontend - Complete SaaS Website (DEPLOYED)
**Status:** ✅ Live on Vercel  
**URL:** https://dream2motion-saas.vercel.app

#### Pages Built (9 total):
- ✅ **Landing Page** (`pages/index.jsx`) - Hero, features, pricing preview, newsletter
- ✅ **Sign Up** (`pages/signup.jsx`) - User registration with validation
- ✅ **Login** (`pages/login.jsx`) - User authentication
- ✅ **Dashboard** (`pages/dashboard.jsx`) - User video library, stats, create button
- ✅ **Video Generation** (`pages/generate.jsx`) - Text/image/sketch input, style selection
- ✅ **Video Player** (`pages/video/index.jsx`) - Playback, metadata, download/share
- ✅ **Pricing** (`pages/pricing.jsx`) - 3 plans (Free/Pro/Enterprise), FAQ
- ✅ **Account Settings** (`pages/account.jsx`) - Profile, billing, API keys
- ✅ **Admin Panel** (`pages/admin/index.jsx`) - User/video/subscription management

#### API Routes Built (8 endpoints):
- ✅ `POST /api/auth/signup` - User registration
- ✅ `POST /api/auth/login` - User authentication
- ✅ `POST /api/auth/logout` - Session termination
- ✅ `GET/PUT /api/user/profile` - Profile management
- ✅ `POST /api/videos/generate` - Video generation request
- ✅ `GET /api/videos/list` - List user videos
- ✅ `GET /api/videos/[id]` - Get video details
- ✅ `GET /api/admin/stats` - Admin dashboard

#### Styling & Configuration:
- ✅ Complete dark theme CSS (`styles/globals.css`)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Next.js 14 configuration
- ✅ All dependencies configured

### 2. Database Setup
**Status:** ✅ Configured  
**Platform:** MongoDB Atlas (Free Tier)

#### Connection Details:
```
MongoDB URI: mongodb+srv://daphnerjames_db_user:m58RiNo1zVUfsirv@dream2motion.4q4o7lo.mongodb.net/dream2motion?appName=dream2motion
```

#### Database Models Created:
- **User Schema** - Email, passwordHash, displayName, plan, credits, stripeCustomerId, timestamps
- **Video Schema** - userId, title, description, videoUrl, thumbnail, style, duration, status, timestamps
- **Subscription Schema** - userId, plan, stripeSubscriptionId, status, expiry dates

### 3. Deployment
**Status:** ✅ Live  
**Platform:** Vercel

#### Current Deployment:
- Domain: `dream2motion-saas.vercel.app`
- Auto-deployment from GitHub enabled
- Root directory: `dream2motion-frontend/`

#### Deployment Settings:
- Framework: Next.js
- Build command: `next build`
- Output directory: `.next`

---

## 🚧 IN PROGRESS / TODO

### Immediate Next Steps (This Week)

#### 1. Environment Variables (CRITICAL)
**File:** `.env.local` in `dream2motion-frontend/`

**Required Variables:**
```env
MONGODB_URI=mongodb+srv://daphnerjames_db_user:m58RiNo1zVUfsirv@dream2motion.4q4o7lo.mongodb.net/dream2motion?appName=dream2motion
JWT_SECRET=create-a-random-secure-key
NEXT_PUBLIC_API_URL=https://dream2motion-saas.vercel.app/api
```

**Action:** Add to Vercel project settings → Environment Variables

#### 2. Database Integration in API Routes
**Priority:** HIGH  
**Files to Update:**

- `/pages/api/auth/signup.js` - Implement user creation with password hashing
  - Add bcryptjs password hashing
  - Save user to MongoDB
  - Generate JWT token
  - Return token to client

- `/pages/api/auth/login.js` - Implement user authentication
  - Verify email exists
  - Compare passwords with bcryptjs
  - Generate JWT token

- `/pages/api/videos/generate.js` - Save video generation request
  - Store metadata in MongoDB
  - Create initial video record with "processing" status
  - Return video ID

- `/pages/api/videos/list.js` - Fetch user videos
  - Query MongoDB for user's videos
  - Return paginated results

- `/pages/api/videos/[id].js` - Get single video details
  - Fetch from MongoDB by ID
  - Verify user ownership
  - Return video data

#### 3. Stripe Payment Integration
**Priority:** HIGH  
**Setup Required:**
1. Create Stripe account: https://dashboard.stripe.com
2. Get API keys (publishable + secret)
3. Create products/prices for 3 plans:
   - Free: $0/month (5 videos)
   - Pro: $29/month (unlimited)
   - Enterprise: Custom pricing

**Implementation:**
- Install Stripe: `npm install stripe @stripe/react-js`
- Create `/pages/api/stripe/` endpoints for:
  - Create checkout session
  - Handle webhook events
  - Update subscription status in DB
  - Cancel subscription

#### 4. Video Generation Service Integration
**Priority:** HIGH  
**Choose One Provider:**

Option A: **ElevenLabs** (recommended for AI quality)
- Website: https://elevenlabs.io
- Pricing: ~$0.15 per video
- API integration in `/pages/api/videos/generate.js`

Option B: **RunwayML**
- Website: https://runwayml.com
- Pricing: Variable
- Better for advanced features

Option C: **Synthesia**
- Website: https://www.synthesia.io
- Pricing: ~$0.25 per video
- Best for professional quality

**Implementation Steps:**
1. Create account with chosen provider
2. Get API key
3. Add to environment variables
4. Create helper function in `/utils/videoGeneration.js`
5. Call in API route when user requests video

#### 5. File Storage (AWS S3)
**Priority:** MEDIUM  
**Setup:**
1. Create AWS account
2. Create S3 bucket for videos
3. Configure CORS
4. Add AWS credentials to environment

**Implementation:**
- Install AWS SDK: `npm install aws-sdk`
- Create `/utils/s3Upload.js` for file uploads
- Store generated videos in S3
- Return URLs to database

#### 6. Email Service
**Priority:** MEDIUM  
**Options:**
- SendGrid (recommended, free tier 100 emails/day)
- Mailgun
- AWS SES

**Implementation:**
- Verification email on signup
- Password reset emails
- Payment confirmation emails
- Video generation notifications

---

## 🔗 GOOGLE SHEETS INTEGRATION

### Current Status: NOT YET INTEGRATED
This is the bridge between your existing Google Sheets workflow and the new Dream2Motion website.

### What Needs to Happen:

#### Option 1: Automated Workflow (Recommended)
```
Google Sheets Data 
    ↓
Google Cloud Function (existing)
    ↓
Dream2Motion API Endpoint
    ↓
Video Generation
    ↓
Store in Database + S3
    ↓
Return to Sheets (auto-update)
```

**Steps:**
1. Update existing Google Cloud Function to POST to: `https://dream2motion-saas.vercel.app/api/videos/generate`
2. Include user authentication token
3. Create new endpoint: `POST /api/videos/batch` for bulk operations
4. Add webhook to update Sheets when video is ready

#### Option 2: Manual Dashboard Upload
- Users login to website
- Upload data/images from Sheets manually
- Generate videos through dashboard
- Download results

#### Option 3: Hybrid (Recommended for Now)
- Setup automation for basic videos
- Use dashboard for custom/complex videos
- Combine results in Sheets

### Implementation Plan:
1. Create service account for API authentication
2. Build batch endpoint that accepts multiple video requests
3. Implement webhook system to notify Sheets when ready
4. Add status tracking (processing/ready/failed)
5. Auto-populate Sheet with video URLs and thumbnails

---

## 📊 DECISIONS MADE IN THIS SESSION

| Decision | Choice | Reason |
|----------|--------|--------|
| Database | MongoDB Atlas | Flexible, scalable, free tier sufficient |
| Deployment | Vercel | Auto-deploy from GitHub, Next.js native support |
| Authentication | JWT Tokens | Stateless, secure, works with APIs |
| Payment | Stripe | Industry standard, great documentation |
| Video Provider | TBD - User to choose | Different providers for different needs |
| Storage | AWS S3 | Reliable, cost-effective, scalable |
| Email | TBD - User to choose | Multiple good options available |

---

## 💰 ESTIMATED COSTS (Monthly)

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| MongoDB | ✅ 512MB | $57+ | Free tier sufficient for launch |
| Vercel | ✅ 100GB bandwidth | $20+ | Free tier sufficient for launch |
| Stripe | ✅ Pay per transaction | 2.9% + $0.30 | Only charge when users pay |
| AWS S3 | ✅ 5GB storage | $0.023/GB | ~$10-50 depending on usage |
| Video API | Varies | $0.10-1 per video | Depends on provider |
| SendGrid Email | ✅ 100/day | $20+ | Free tier sufficient for launch |
| **TOTAL LAUNCH** | **$0** | **$30-100+** | Scales with usage |

---

## 🎯 MILESTONES & TIMELINE

### Phase 1: Foundation (Current - Week of May 17)
- ✅ Frontend deployed
- 🔄 Database connected
- TODO: API routes working
- TODO: Stripe integration

### Phase 2: Core Features (Week of May 24)
- TODO: Video generation API connected
- TODO: File storage (S3)
- TODO: Email notifications
- TODO: User authentication working end-to-end

### Phase 3: Integration (Week of May 31)
- TODO: Google Sheets integration
- TODO: Batch video processing
- TODO: Webhook notifications
- TODO: Admin dashboard functional

### Phase 4: Polish (Week of June 7)
- TODO: Testing & bug fixes
- TODO: Performance optimization
- TODO: Security audit
- TODO: Launch to production

---

## 🔧 TECHNICAL STACK

```
Frontend:
- Next.js 14
- React 18
- CSS3 (dark theme)
- JWT Authentication

Backend:
- Node.js API routes (Next.js)
- MongoDB database
- Stripe payments
- AWS S3 storage
- SendGrid email
- Video Generation API (TBD)

Deployment:
- GitHub (source control)
- Vercel (hosting)
- MongoDB Atlas (database)
- AWS (storage)
- Stripe (payments)
```

---

## 📝 CODE LOCATIONS

### Critical Files:
- **Landing Page:** `dream2motion-frontend/pages/index.jsx`
- **Dashboard:** `dream2motion-frontend/pages/dashboard.jsx`
- **Video Generation:** `dream2motion-frontend/pages/generate.jsx`
- **API Routes:** `dream2motion-frontend/pages/api/`
- **Styling:** `dream2motion-frontend/styles/globals.css`
- **Config:** `dream2motion-frontend/.env.local` (create this)

### Next to Create:
- `dream2motion-frontend/lib/db.js` - MongoDB connection
- `dream2motion-frontend/utils/auth.js` - JWT utilities
- `dream2motion-frontend/utils/videoGeneration.js` - Video API calls
- `dream2motion-frontend/utils/stripe.js` - Stripe utilities
- `dream2motion-frontend/utils/s3Upload.js` - File uploads
- `dream2motion-frontend/middleware/requireAuth.js` - Auth middleware

---

## 🚀 NEXT IMMEDIATE ACTIONS

### For Next Session:
1. **Add environment variables** to Vercel
2. **Choose video generation provider** (ElevenLabs/Runway/Synthesia)
3. **Set up Stripe account** and get API keys
4. **Implement database calls** in API routes
5. **Test authentication flow** end-to-end
6. **Plan Google Sheets integration** details

### Quick Commands Reference:
```bash
# Install dependencies
cd dream2motion-frontend
npm install

# Run locally
npm run dev

# Build for production
npm build

# Push changes to GitHub
git add -A
git commit -m "your message"
git push origin master
```

---

## ❓ QUESTIONS FOR NEXT SESSION

1. Which video generation provider do you prefer? (ElevenLabs/Runway/Synthesia)
2. Do you want automated Google Sheets → Videos workflow or manual dashboard upload?
3. Should free tier have watermark?
4. Do you need user email verification?
5. What's your target launch date?

---

## 📞 CONTACTS & CREDENTIALS

| Service | Email | Password | Status |
|---------|-------|----------|--------|
| MongoDB | daphnerjames@gmail.com | [Saved in account] | ✅ Configured |
| GitHub | daphnerjames-glitch | [Saved in Git] | ✅ Active |
| Vercel | daphnerjames@gmail.com | [OAuth] | ✅ Connected |
| Stripe | [TBD] | [TBD] | 🔄 Pending |
| AWS | [TBD] | [TBD] | 🔄 Pending |

---

## 🎓 RESOURCES

- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **JWT Tutorial:** https://jwt.io

---

**Generated:** May 17, 2026  
**Next Review:** May 24, 2026  
**Status:** In Development - Ready for Phase 2
