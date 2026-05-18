# YouTube OAuth Setup for Cloud Run

## Status: Code Updated ✅

main.py has been updated with full YouTube upload + Buzzsprout integration. Videos will now automatically post to YouTube and Buzzsprout.

## What You Need to Set Up

Add these environment variables to Cloud Run:

| Variable | Value | Description |
|----------|-------|-------------|
| `YT_CLIENT_ID` | `260985892935-2edn1n84b3l23e4inck0r6k6g81vllfd.apps.googleusercontent.com` | From sync_sources document |
| `YT_CLIENT_SECRET` | `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` | From sync_sources document |
| `GRANNY_YT_REFRESH` | **YOUR GRANNY REFRESH TOKEN** | Login: daphnerjames@gmail.com (Granny Sleuth YouTube) |
| `REBEL_YT_REFRESH` | **YOUR REBEL REFRESH TOKEN** | Login: daphnerjames@gmail.com (Closet Rebel YouTube) |
| `GRANNY_BUZZSPROUT_TOKEN` | **YOUR BUZZSPROUT TOKEN** | Login: daphnerjames@gmail.com (Granny podcast) |
| `GRANNY_BUZZSPROUT_PODCAST_ID` | `2615568` | Granny podcast ID |
| `REBEL_BUZZSPROUT_TOKEN` | **YOUR REBEL BUZZSPROUT TOKEN** | Login: bluefeatherwolf18@gmail.com (Rebel podcast - if using) |
| `REBEL_BUZZSPROUT_PODCAST_ID` | **YOUR REBEL PODCAST ID** | Rebel podcast ID (if using) |

## How to Add Environment Variables to Cloud Run

### Method 1: Via Google Cloud Console (Easiest)

1. Go to: https://console.cloud.google.com/run/detail/us-central1/autonomous-income-engine
2. Click "Edit & deploy new revision"
3. Under "Runtime settings" expand "Runtime environment variables"
4. Click "Add variable"
5. Add each variable from the table above:
   - Name: (e.g., `YT_CLIENT_ID`)
   - Value: (the actual token/ID)
6. Click "Deploy"

### Method 2: Via Secret Manager (More Secure)

1. Go to: https://console.cloud.google.com/security/secret-manager
2. Create secrets for each credential
3. In Cloud Run, reference secrets instead of plain values
4. More secure but slightly more complex

## Where to Find Your Refresh Tokens

### YouTube Refresh Tokens

If you already have refresh tokens (you might):

1. Check Google Drive documents
2. Check if stored in Vercel environment variables
3. If missing, run OAuth flow again

**If tokens are missing:** You need to run the OAuth authentication flow again for each YouTube account. This involves:
1. Going through Google's OAuth consent screen
2. Authorizing the app to upload videos
3. Capturing the refresh token

### Buzzsprout API Tokens

1. **For Granny podcast** (daphnerjames@gmail.com):
   - Go to: https://www.buzzsprout.com/my/profile/api
   - Sign in with daphnerjames@gmail.com
   - Copy the API token
   - Paste as `GRANNY_BUZZSPROUT_TOKEN`

2. **For Rebel podcast** (bluefeatherwolf18@gmail.com):
   - Go to: https://www.buzzsprout.com/my/profile/api
   - Sign in with bluefeatherwolf18@gmail.com
   - Copy the API token
   - Paste as `REBEL_BUZZSPROUT_TOKEN`

**To find podcast IDs:**
- Granny: URL is `https://www.buzzsprout.com/admin/2615568/...` → ID is `2615568`
- Rebel: Check URL in same way

## Deployment Steps

1. **Get all credentials** using instructions above
2. **Add environment variables** to Cloud Run (see Method 1)
3. **Deploy updated code**:
   ```bash
   cd C:\Users\daphn\Desktop\Brain
   gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine
   ```
4. **Test**: Run Google Apps Script → Check row H for "success"

## What Happens After Deployment

When you post from Google Sheets:

**Granny YouTube:**
- ✅ Video generates via Vidu API (60 sec, 16:9)
- ✅ Uploads to YouTube (daphnerjames@gmail.com / Granny Sleuth channel)
- ✅ Audio extracted and posted to Buzzsprout podcast
- ✅ Sheet updated with YouTube URL + status

**Closet Rebel YouTube:**
- ✅ Video generates via Vidu API (60 sec, 9:16 shorts)
- ✅ Uploads to YouTube Shorts (daphnerjames@gmail.com / Closet Rebel channel)
- ✅ Sheet updated with YouTube URL + status

**Etsy:**
- ✅ Creates draft product listing
- ✅ Sheet updated with Etsy listing URL + status

## Troubleshooting

**"YouTube OAuth not configured" in response**
- Environment variables not set in Cloud Run
- Check if YT_CLIENT_ID and YT_CLIENT_SECRET are added

**"Buzzsprout credentials not configured"**
- GRANNY_BUZZSPROUT_TOKEN or podcast ID missing
- Add them to Cloud Run environment variables

**"Failed to authenticate with YouTube"**
- Refresh tokens invalid or expired
- May need to re-run OAuth flow

## Quick Checklist

- [ ] Found all credentials (YouTube refresh tokens, Buzzsprout API tokens)
- [ ] Added environment variables to Cloud Run
- [ ] Deployed updated main.py
- [ ] Test posted May 13-15 content
- [ ] Videos appeared on YouTube within 5-10 minutes
- [ ] Audio appeared on Buzzsprout podcast

## Need OAuth Tokens?

If you're missing YouTube refresh tokens, they should be in:
1. Vercel environment variables (check dashboard)
2. Google Drive documents (you had a credentials file)
3. Or you need to re-authorize

Let me know what credentials you have and I can finalize the setup!
