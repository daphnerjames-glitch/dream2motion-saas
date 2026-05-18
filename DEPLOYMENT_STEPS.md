# Deployment: Multi-Channel Autonomous Income Engine

## Step 1: Copy Apps Script to Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1ybTJYwPR_IK-ef9_V3Tp_a_3l-spCElLKITXTzmRBAs/edit
2. Click **Extensions** > **Apps Script**
3. Delete any existing code in `Code.gs`
4. Copy the entire contents of `Code.gs` from your Brain folder
5. Paste it into the Apps Script editor
6. **Click Save** (Ctrl+S)
7. You should see no "Unsaved changes" indicator

## Step 2: Deploy Cloud Function

You need to deploy the `main.py` file as a Google Cloud Function. Choose ONE method:

### Option A: Deploy via Google Cloud Console (Easiest)
1. Go to https://console.cloud.google.com/functions
2. Click **Create Function**
3. Settings:
   - Name: `process_income_engine_pipeline`
   - Runtime: Python 3.11
   - Trigger: HTTP
   - Authentication: Require authentication
4. Paste `main.py` into the editor
5. Click **Deploy**
6. Copy the **Trigger URL** (looks like `https://region-projectid.cloudfunctions.net/process_income_engine_pipeline`)
7. Update `Code.gs` line 70 with this URL

### Option B: Deploy via gcloud CLI (Faster for updates)
```bash
cd C:\Users\daphn\Desktop\Brain
gcloud functions deploy process_income_engine_pipeline \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --entry-point process_income_engine_pipeline
```

Note the returned URL and update `Code.gs` line 70.

## Step 3: Set Up Trigger in Apps Script

1. In Apps Script, click the **Triggers** (clock icon) on the left sidebar
2. Click **+ Add Trigger** (blue button, bottom right)
3. Configure:
   - Function: `runAutonomousIncomeEngine`
   - Event source: **Time-driven**
   - Type: **Minutes timer**
   - Interval: **Every 15 minutes**
4. Click **Save**

**That's it!** The system will now automatically check your sheets every 15 minutes and post any pending content.

## Step 4: Manual Test

Before relying on automated posting:

1. In Apps Script, click the **Play button** next to `testEngine`
2. Check the **Execution log** at the bottom
3. It should show:
   - Processing each channel
   - Sending payloads to Cloud Function
   - Receiving responses

## Step 5: Verify Sheets Are Properly Named

The script expects these exact sheet names:
- `Granny YouTube` (GID: 1637718687)
- `Closet Rebel YouTube` (GID: 1127933626)
- `Etsy` (GID: 1860595195)

If your sheets have different names, update the `CHANNELS` object in `Code.gs`.

## Step 6: Add Content Rows

For each sheet, add rows with this structure:
- Column A: Date (YYYY-MM-DD)
- Column B: Title
- Column C: Description
- Column D: Tags
- Column E: API Key (Vidu for YouTube, Etsy API for Etsy)
- Column F: Post URL (filled by system after posting)
- Column G: Status (leave blank for pending)
- Column H: Notes

Rows with blank Status (column G) will be processed.

## Troubleshooting

### "Sheet with gid X not found"
- Your sheet names don't match. Check the exact names in your spreadsheet.
- Update `CHANNELS` object in `Code.gs` with correct names.

### "Invalid Cloud Function URL"
- The URL must be accessible from the internet.
- Ensure Cloud Function has **"Allow unauthenticated invocations"** enabled.

### Trigger not firing
- Check that trigger is saved in Apps Script (click **Triggers** icon)
- Look at **Execution log** to see if there are errors

### Cloud Function returns 403
- Service account permissions issue
- Or security token mismatch (token in Apps Script must match token in main.py)

## Next: Full Integration

Once this is working, we'll add:
- Real Vidu API video generation
- Real YouTube uploads
- Real Etsy product creation
- Buzzsprout podcast posting
- Error recovery and retry logic
