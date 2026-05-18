$PROJECT_ID = "autonomous-income-engine"
$SERVICE_NAME = "autonomous-income-engine"
$REGION = "us-central1"

Write-Host "Deploying with new Vidu key (without Gemini)..." -ForegroundColor Cyan

gcloud run deploy $SERVICE_NAME `
    --source=. `
    --region=$REGION `
    --platform=managed `
    --project=$PROJECT_ID `
    --update-env-vars=GRANNY_VIDU_KEY=vda_953017546485800960_TvsGrHjoSlmmWnlgQDGFn9e3XYEcyGqz,REBEL_VIDU_KEY=vda_953018133524783104_5LuHt1AUO1wFMlYBrF0WppEq4Hj8mbHS

Write-Host "Deployment initiated!" -ForegroundColor Green
