# Critical Fix Applied - May 15, 2026

## Problem Diagnosed
Google Sheets was returning `api_error: 500` when trying to post content. The Cloud Run function was being reached but failing to execute.

## Root Cause Found
The **Dockerfile** was configured incorrectly:
```dockerfile
# WRONG - was using:
CMD exec gunicorn --bind :$PORT --workers 1 --timeout 0 main:process_income_engine_pipeline
```

This tried to run the function as a WSGI application with gunicorn, but the function uses `@functions_framework.http` decorator, which requires the functions-framework server.

## Fix Applied

### 1. Updated Dockerfile
```dockerfile
# CORRECT - now uses:
CMD exec functions-framework --target=process_income_engine_pipeline --port=${PORT:-8080}
```

### 2. Updated requirements.txt
- Removed `gunicorn==21.2.0`
- Kept `functions-framework==3.5.0` (this is the correct server)
- Kept `requests==2.31.0`

## What to Do Now

### Step 1: Deploy the Fixed Code
From your terminal in `C:\Users\daphn\Desktop\Brain\`:

```bash
gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine
```

Or simply double-click: `deploy.bat`

### Step 2: Wait for Deployment
- Takes about 2-3 minutes
- Watch for "Service [autonomous-income-engine] revision [XXXXX] has been deployed"

### Step 3: Test Posting
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1k47LHV0C0c-KVN_00M-gIss1mznLnzLmAJul8x1qTU8/edit
2. Find rows with pending posts (May 13-15)
3. Run `testEngine()` from the Apps Script console
4. Check row H - should now show "success" instead of "api_error: 500"

### Step 4: Watch Videos Generate
Once deployment is complete and testing succeeds:
1. Videos will start generating via Vidu API
2. Status updates will appear in row H and I
3. YouTube links will appear in row J

## Files Changed
- ✅ **Dockerfile** - Fixed server configuration
- ✅ **requirements.txt** - Removed gunicorn
- ✅ **deploy.bat** - Created for easy Windows deployment
- ✅ **SYSTEM_OVERVIEW.md** - Updated with fix documentation

## Why This Happened
The original Dockerfile was written for a WSGI-style application using gunicorn. The function was then rewritten to use `@functions_framework.http`, but the Dockerfile wasn't updated to match. This mismatch caused the 500 errors.

## Status
🟢 **Ready to Deploy** - All fixes complete, just need to run the deployment command.
