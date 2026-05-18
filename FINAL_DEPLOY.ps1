$PROJECT_ID = "autonomous-income-engine"
$SERVICE_NAME = "autonomous-income-engine"
$REGION = "us-central1"

Write-Host "Creating Vidu secrets..." -ForegroundColor Cyan

echo "vda_952254575019040768_zJiqalVnTrmhUuDZQPv3KCK3WcA3RGMV" | gcloud secrets create GRANNY_VIDU_KEY --replication-policy=automatic --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null
echo "vda_952306322504687616_1rkmxncjGMeBnYXLLKYdc8d5eS9yy2tk" | gcloud secrets create REBEL_VIDU_KEY --replication-policy=automatic --project=$PROJECT_ID --data-file=- 2>&1 | Out-Null

Write-Host "Granting access..." -ForegroundColor Cyan

gcloud secrets add-iam-policy-binding GRANNY_VIDU_KEY --member="serviceAccount:autonomous-income-engine@autonomous-income-engine.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID --quiet 2>&1 | Out-Null

gcloud secrets add-iam-policy-binding REBEL_VIDU_KEY --member="serviceAccount:autonomous-income-engine@autonomous-income-engine.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=$PROJECT_ID --quiet 2>&1 | Out-Null

Write-Host "Deploying..." -ForegroundColor Cyan

gcloud run deploy $SERVICE_NAME --source=. --region=$REGION --platform=managed --project=$PROJECT_ID --set-env-vars=YT_CLIENT_ID=sm://YT_CLIENT_ID,YT_CLIENT_SECRET=sm://YT_CLIENT_SECRET,GRANNY_YT_REFRESH=sm://GRANNY_YT_REFRESH,REBEL_YT_REFRESH=sm://REBEL_YT_REFRESH,GRANNY_BUZZSPROUT_TOKEN=sm://GRANNY_BUZZSPROUT_TOKEN,REBEL_BUZZSPROUT_TOKEN=sm://REBEL_BUZZSPROUT_TOKEN,GRANNY_VIDU_KEY=sm://GRANNY_VIDU_KEY,REBEL_VIDU_KEY=sm://REBEL_VIDU_KEY,GRANNY_BUZZSPROUT_PODCAST_ID=2615568,REBEL_BUZZSPROUT_PODCAST_ID=2615589

Write-Host "Done!" -ForegroundColor Green
