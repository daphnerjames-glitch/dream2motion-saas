$PROJECT_ID = "autonomous-income-engine"
$SERVICE_NAME = "autonomous-income-engine"
$REGION = "us-central1"

Write-Host "Redeploying with Vidu keys..." -ForegroundColor Cyan

gcloud run deploy $SERVICE_NAME `
    --source=. `
    --region=$REGION `
    --platform=managed `
    --project=$PROJECT_ID `
    --set-env-vars=YT_CLIENT_ID=sm://YT_CLIENT_ID,YT_CLIENT_SECRET=sm://YT_CLIENT_SECRET,GRANNY_YT_REFRESH=sm://GRANNY_YT_REFRESH,REBEL_YT_REFRESH=sm://REBEL_YT_REFRESH,GRANNY_BUZZSPROUT_TOKEN=sm://GRANNY_BUZZSPROUT_TOKEN,REBEL_BUZZSPROUT_TOKEN=sm://REBEL_BUZZSPROUT_TOKEN,GRANNY_BUZZSPROUT_PODCAST_ID=2615568,REBEL_BUZZSPROUT_PODCAST_ID=2615589,GRANNY_VIDU_KEY=vda_952254575019040768_zJiqalVnTrmhUuDZQPv3KCK3WcA3RGMV,REBEL_VIDU_KEY=vda_952306322504687616_1rkmxncjGMeBnYXLLKYdc8d5eS9yy2tk

Write-Host ""
Write-Host "Redeployment complete!" -ForegroundColor Green
