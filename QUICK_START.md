# Quick Start: Fix Your Automation in 5 Minutes

## What's Fixed
✅ Multi-channel code (handles Granny, Rebel, Etsy separately)
✅ No more "Unsaved changes" issue  
✅ Reads from correct sheets with correct GIDs  
✅ Sends payloads to Cloud Function for processing  

All files saved in your Brain folder:
- `Code.gs` — Copy this into Google Apps Script
- `main.py` — Deploy as Cloud Function
- `DEPLOYMENT_STEPS.md` — Full instructions

---

## THREE THINGS YOU NEED TO DO:

### 1️⃣ Paste Code Into Google Sheets (2 min)
```
1. Open your sheet: https://docs.google.com/spreadsheets/d/1ybTJYwPR_IK-ef9_V3Tp_a_3l-spCElLKITXTzmRBAs/
2. Extensions > Apps Script
3. Delete all code in Code.gs
4. Open Code.gs file from your Brain folder
5. Copy ALL of it
6. Paste into Apps Script editor
7. Click Save (Ctrl+S)
```

### 2️⃣ Deploy Cloud Function (2 min)
You need the `main.py` deployed. Two options:

**EASIEST:** Paste into Google Cloud Console
```
1. Go to https://console.cloud.google.com/functions
2. Click "Create Function"
3. Name: process_income_engine_pipeline
4. Runtime: Python 3.11
5. Trigger: HTTP (allow unauthenticated)
6. Copy main.py file into editor
7. Click Deploy
8. Wait ~1 minute for deployment
9. Copy the resulting URL (looks like https://us-central1-YOURPROJECT.cloudfunctions.net/process_income_engine_pipeline)
```

**OR via Command Line:**
```
cd C:\Users\daphn\Desktop\Brain
gcloud functions deploy process_income_engine_pipeline --runtime python311 --trigger-http --allow-unauthenticated
```

### 3️⃣ Tell Me the Cloud Function URL
Once deployed, send me the URL (Step 2, step 9). It looks like:
```
https://us-central1-PROJECTID.cloudfunctions.net/process_income_engine_pipeline
```

Then I'll update Code.gs with the correct URL.

---

## Once You've Done All 3:

I'll:
1. Update Code.gs with your Cloud Function URL
2. Push the final code to your sheet via clasp
3. Set up the automated trigger (every 15 minutes)
4. Test with your May 13-14 content

Then your content will automatically post.

---

## Your Pending Content (Ready to Post):
- **May 13**: Granny YouTube video
- **May 14**: Closet Rebel YouTube shorts
- **May 14**: Etsy product listing

Just make sure those rows are in your sheets with Status column blank, and the system will post them.

---

## Already Have a Cloud Function?
If you already deployed one, just send me the URL from Step 2.9 above and we'll use that instead.
