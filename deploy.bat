@echo off
REM Deploy autonomous-income-engine to Cloud Run
REM Run this script from the Brain folder

echo Deploying to Cloud Run...
gcloud run deploy autonomous-income-engine --source . --region us-central1 --platform managed --project autonomous-income-engine

echo.
echo Deployment complete!
pause
