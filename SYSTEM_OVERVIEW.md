# Autonomous Income Engine - System Overview & Setup Guide

## Goal

Automate the posting of content across three income-generating channels to save time and ensure consistent daily posting:

1. **Granny YouTube** - Long-form videos (16:9 aspect ratio) with audio extracted to Buzzsprout podcast
2. **Closet Rebel YouTube** - Short-form content (9:16 aspect ratio) optimized for YouTube Shorts
3. **Etsy** - Product listings for handmade/vintage items

**Outcome:** Once content is entered into Google Sheets, it automatically generates videos via AI, posts them to YouTube, and creates Etsy listings with zero manual intervention.

---

## System Architecture

```
Google Sheets (Content Input)
    ↓
Google Apps Script (Orchestrator)
    ↓
Cloud Run Function (Processing Engine)
    ↓
├─→ Vidu API (Video Generation)
├─→ YouTube API (Video Posting)
├─→ Buzzsprout API (Podcast)
└─→ Etsy API (Product Listing)
```

### How It Works:

1. **You add content to Google Sheets** with title, description, tags, etc.
2. **Google Apps Script** reads the sheet and sends a request to Cloud Run
3. **Cloud Run Function** (main.py) routes the request to the correct handler
4. **Handler processes the request**:
   - Granny: Generates video via Vidu → uploads to YouTube → extracts audio → posts to Buzzsprout
   - Rebel: Generates 9:16 video via Vidu → uploads to YouTube Shorts
   - Etsy: Creates draft product listing via Etsy API
5. **Sheet is updated** with status, video IDs, and links

---

## File Locations & Purposes

### Local Files (C:\Users\daphn\Desktop\Brain\)

| File | Purpose |
|------|---------|
| **main.py** | Core Cloud Run function - routes requests and calls APIs |
| **requirements.txt** | Python dependencies (functions-framework, requests) |
| **Dockerfile** | Container configuration for Cloud Run |
| **cloudbuild.yaml** | Cloud Build configuration for automated deployment |
| **Code.gs** | Main Google Apps Script orchestrator |
| **Code_Granny.gs** | Granny YouTube specific script |
| **Code_Rebel.gs** | Closet Rebel YouTube specific script |
| **Code_Etsy.gs** | Etsy specific script |
| **Granny_data.csv** | Sample data for Granny channel |
| **Rebel_data.csv** | Sample data for Closet Rebel channel |
| **Etsy_data.csv** | Sample data for Etsy channel |
| **THREE_SHEETS_SETUP.md** | Instructions for setting up the 3 Google Sheets |
| **DEPLOYMENT_STEPS.md** | Step-by-step deployment guide |
| **QUICK_START.md** | Quick reference for common tasks |
| **SYSTEM_OVERVIEW.md** | This file |

### Cloud Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| **Cloud Run Service** | `autonomous-income-engine` (us-central1) | Hosts the main.py function |
| **Cloud Source Repository** | `autonomous-income-engine` | Stores source code for automatic builds |
| **Cloud Build** | Cloud Build Dashboard | Automatically builds & deploys on code updates |
| **Cloud Logging** | Cloud Console → Logging | View execution logs & debug issues |

### Google Cloud Projects & Services

| Service | Project | Purpose |
|---------|---------|---------|
| Cloud Run | autonomous-income-engine | Execute Python function |
| Cloud Build | autonomous-income-engine | Build Docker containers |
| Cloud Source Repositories | autonomous-income-engine | Version control for source code |
| Cloud Logging | autonomous-income-engine | Monitor execution & debug |

---

## API Keys & Configuration

### Stored in main.py (Lines 20-23)

```python
GRANNY_VIDU_KEY = "vda_952254575019040768_zJiqalVnTrmhUuDZQPv3KCK3WcA3RGMV"
REBEL_VIDU_KEY = "vda_952306322504687616_1rkmxncjGMeBnYXLLKYdc8d5eS9yy2tk"
ETSY_API_KEY = "prmwtrvb9gdxyu7cl90syii7"
ETSY_SHARED_SECRET = "0e7p6mx7zf"
```

**⚠️ Security Note:** These API keys should ideally be stored in Google Cloud Secret Manager, not hardcoded in the source. See Security section below.

### Required Accounts & Keys

| Service | Account | Key Location |
|---------|---------|--------------|
| Vidu | Granny account | GRANNY_VIDU_KEY in main.py |
| Vidu | Closet Rebel account | REBEL_VIDU_KEY in main.py |
| YouTube | Granny channel | Configured in Google Apps Script |
| YouTube | Closet Rebel channel | Configured in Google Apps Script |
| Buzzsprout | Granny podcast | API key in Code_Granny.gs |
| Buzzsprout | Rebel podcast | API key in Code_Rebel.gs |
| Etsy | Your shop | ETSY_API_KEY & ETSY_SHARED_SECRET |
| Google Sheets | Your account | Connected via Google Apps Script |

---

## Data Flow & Sheet Setup

### Google Sheets Structure (3 Separate Sheets)

Each channel has its own Google Sheet with columns:

**Granny YouTube Sheet:**
- Title
- Description
- Tags
- Status (auto-filled)
- Video URL (auto-filled)
- Podcast URL (auto-filled)

**Closet Rebel YouTube Sheet:**
- Title
- Description
- Tags
- Status (auto-filled)
- Video URL (auto-filled)

**Etsy Products Sheet:**
- Title
- Description
- Tags
- Price
- Status (auto-filled)
- Listing URL (auto-filled)

To set up sheets: See `THREE_SHEETS_SETUP.md`

---

## How to Deploy & Update

### Quick Deploy (After Fixes)
**The Dockerfile and requirements.txt have been fixed. Deploy with:**

```bash
cd C:\Users\daphn\Desktop\Brain
gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine
```

Or simply run `deploy.bat` from the Brain folder.

### What Changed
- **Dockerfile**: Now uses functions-framework instead of gunicorn (fixes 500 errors)
- **requirements.txt**: Removed gunicorn dependency

### After Code Changes
1. Update files in C:\Users\daphn\Desktop\Brain\
2. Deploy using the command above (gcloud CLI or deploy.bat)
3. Wait for deployment to complete (~2 minutes)
4. Test by posting from Google Sheets - row H should show "success" instead of "api_error"

---

## Critical Fixes Applied

### 1. Vidu API Fix (main.py Lines 96-140)
The Vidu API had three breaking changes:
1. Old endpoint: `api.vidu.ai/v1/generate` → New: `api.vidu.com/ent/v2/text2video`
2. Old auth: `Bearer {token}` → New: `Token {token}`
3. Old model: `vidu-1.0` → New: `vidu3-turbo`

All three fixes are in the `call_vidu_api()` function:
- Line 102: Endpoint updated
- Line 104: Auth header updated
- Line 111: Model name updated

**This fix applies to BOTH Granny and Closet Rebel channels** because they share the same API communication function.

### 2. Cloud Run Server Fix (Dockerfile)
**Issue**: The Dockerfile was using gunicorn directly instead of functions-framework, causing 500 errors when Google Apps Script tried to post content.

**Fix Applied**: 
- Changed CMD from: `gunicorn --bind :$PORT --workers 1 --timeout 0 main:process_income_engine_pipeline`
- Changed CMD to: `functions-framework --target=process_income_engine_pipeline --port=${PORT:-8080}`
- Removed gunicorn from requirements.txt

This allows the Cloud Run service to properly execute the functions-framework decorated function.

---

## Troubleshooting Guide

### Videos Not Generating
1. Check Cloud Logging: https://console.cloud.google.com/logs
2. Look for "Vidu API error" messages
3. Verify API keys are correct in main.py
4. Ensure Vidu accounts have sufficient credits

### Videos Not Posting to YouTube / Getting "api_error: 500"
**Latest Fix (May 15)**: The Dockerfile was using gunicorn instead of functions-framework. This has been fixed.
1. Redeploy Cloud Run with the fixed Dockerfile
2. Run: `gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine`
3. Wait for deployment to complete
4. Try posting again - row H should now show "success"

If still getting errors:
1. Check YouTube API authentication in Google Apps Script
2. Verify the channel credentials are correct
3. Check YouTube API quotas: https://console.cloud.google.com/apis

### Etsy Listings Not Creating
1. Verify ETSY_API_KEY and ETSY_SHARED_SECRET are correct
2. Check Etsy API rate limits
3. Ensure product data is properly formatted

### Cloud Run Function Timeouts
1. Check "Update service" → "General" → "Timeout" setting
2. If processing takes >600 seconds, increase timeout
3. Logs will show timeout errors

### How to Check Logs
1. Go to: https://console.cloud.google.com/logs
2. Filter by resource: "Cloud Run Revision"
3. Service name: "autonomous-income-engine"
4. View recent errors and details

---

## Security Best Practices (To Implement)

### Current Issue
API keys are hardcoded in main.py - this is a security risk if the code is ever shared or compromised.

### Recommended Fix
Move API keys to Google Cloud Secret Manager:

1. Go to: https://console.cloud.google.com/security/secret-manager
2. Create secrets:
   - `granny-vidu-key`
   - `rebel-vidu-key`
   - `etsy-api-key`
   - `etsy-shared-secret`
3. Update main.py to fetch from Secret Manager instead of hardcoding

---

## Quick Command Reference

### Deploy Changes
```bash
# From C:\Users\daphn\Desktop\Brain\
gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine
```

### View Recent Logs
```bash
gcloud run logs read autonomous-income-engine --region us-central1 --limit 50
```

### Monitor Specific Date
```bash
gcloud run logs read autonomous-income-engine --region us-central1 --limit 100 | grep "2026-05-15"
```

### Test Function Locally
```bash
python3 main.py
# Then POST to http://localhost:8080 with test data
```

---

## Important Contacts & Resources

### API Documentation
- **Vidu**: https://platform.vidu.com/docs/text-to-video
- **YouTube API**: https://developers.google.com/youtube
- **Buzzsprout API**: https://www.buzzsprout.com/api
- **Etsy API**: https://developers.etsy.com

### Cloud Run Documentation
- **Cloud Run**: https://cloud.google.com/run/docs
- **Cloud Build**: https://cloud.google.com/build/docs
- **Cloud Logging**: https://cloud.google.com/logging/docs

### Your Google Cloud Project
- **Project ID**: `autonomous-income-engine`
- **Console URL**: https://console.cloud.google.com/run?project=autonomous-income-engine

---

## Next Steps & Roadmap

### Immediate (Completed)
- ✅ Fixed Vidu API integration (endpoint, auth, model)
- ✅ Fixed Cloud Run server configuration (Dockerfile, functions-framework)
- ✅ Code updated and ready for deployment
- ⏳ Awaiting deployment via gcloud CLI

### Short Term (This Week)
- [ ] **Deploy fixed code to Cloud Run** (run: `gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine`)
- [ ] Test posting May 13-15 backlogged content
- [ ] Monitor for "success" status in row H
- [ ] Verify videos generate and post to YouTube

### Medium Term (This Month)
- [ ] Move API keys to Secret Manager
- [ ] Add error notifications to email
- [ ] Set up automatic daily posting schedule
- [ ] Add analytics dashboard

### Long Term (Future)
- [ ] Expand to additional platforms (TikTok, Instagram)
- [ ] Implement content approval workflow
- [ ] Add performance metrics tracking
- [ ] Create admin dashboard

---

## Document History

| Date | Change | By |
|------|--------|-----|
| 2026-05-15 | Created initial system overview | Claude |
| 2026-05-15 | Added Vidu API fix documentation | Claude |
| 2026-05-15 | Diagnosed and fixed Cloud Run Dockerfile issue (gunicorn → functions-framework) | Claude |
| 2026-05-15 | Updated deployment instructions and troubleshooting | Claude |

---

**Last Updated**: May 15, 2026
**Status**: Fixed - Ready for Cloud Run deployment
**Contact**: daphnerjames@gmail.com
**Critical**: Deploy changes with: `gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine`
