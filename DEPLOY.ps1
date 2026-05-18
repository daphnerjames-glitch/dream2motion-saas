$PROJECT_ID = "autonomous-income-engine"
$SERVICE_NAME = "autonomous-income-engine"
$SERVICE_ACCOUNT = "autonomous-income-engine@autonomous-income-engine.iam.gserviceaccount.com"
$REGION = "us-central1"

Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan

gcloud run deploy $SERVICE_NAME `
    --source=. `
    --region=$REGION `
    --platform=managed `
    --project=$PROJECT_ID `
    --set-env-vars=YT_CLIENT_ID=sm://YT_CLIENT_ID,YT_CLIENT_SECRET=sm://YT_CLIENT_SECRET,GRANNY_YT_REFRESH=sm://GRANNY_YT_REFRESH,REBEL_YT_REFRESH=sm://REBEL_YT_REFRESH,GRANNY_BUZZSPROUT_TOKEN=sm://GRANNY_BUZZSPROUT_TOKEN,REBEL_BUZZSPROUT_TOKEN=sm://REBEL_BUZZSPROUT_TOKEN,GRANNY_BUZZSPROUT_PODCAST_ID=2615568,REBEL_BUZZSPROUT_PODCAST_ID=2615589

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
