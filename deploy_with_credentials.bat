@echo off
REM Deploy with YouTube OAuth and Buzzsprout credentials

set PROJECT_ID=autonomous-income-engine
set REGION=us-central1
set SERVICE_NAME=autonomous-income-engine

echo Deploying Autonomous Income Engine with credentials...
echo.

gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --region %REGION% ^
  --platform managed ^
  --project %PROJECT_ID% ^
  --set-env-vars=^
YT_CLIENT_ID="260985892935-2edn1n84b3l23e4inck0r6k6g81vllfd.apps.googleusercontent.com",^
YT_CLIENT_SECRET="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",^
GRANNY_YT_REFRESH="ya29.a0AQvPyIMZ7dMcdoZ21Vy0fxSErN-Pp7ucBp_-YpS3LehTBfBWO7rT-PcDzMeKzMGxI6wNKzX4Tn4Yse99BS1JFXKGjmwJzZNDOYELGPrbjciouZOlokvOqZHI8OSKo5_iwuPdyJtHE8P_rNY3rlGg6tr9whaS2x6lsIF3K8nTHVs4TFBxHgvngSmJgDH9SV8Ys7GEBqQaCgYKAXMSARISFQHGX2Mis9uGotg9v-7gNS9jAJvhTg0206",^
REBEL_YT_REFRESH="ya29.a0AQvPyINlMRs5FTkMHfTzujCHDI6DCMSsDfLqbTfpKuyKDnjTFRkXcHsCfDOOUMcso_0VXaQq6U2Uw-bYKqsvwbc755lHxs9MQeWWJ5XcZux8e7c9FvudN31r9OY5Zxljfo-5lkeUrsZ8VRFi5f0vRjZC3Dv5QTX82A9F4heFCPB_kRsObXMN1LN3QSKLPAmZuB6iJUoaCgYKAVgSARcSFQHGX2MiH38vPL5m00D1l6-YlPMYIA0206",^
GRANNY_BUZZSPROUT_TOKEN="36a9c14335f90ca4256810537510ee21",^
GRANNY_BUZZSPROUT_PODCAST_ID="2615568",^
REBEL_BUZZSPROUT_TOKEN="de307c10b5ddb239d262d641b288177b",^
REBEL_BUZZSPROUT_PODCAST_ID="2615589"

if %ERRORLEVEL% equ 0 (
  echo.
  echo ✅ Deployment successful!
  echo.
  echo Service URL: https://autonomous-income-engine-260985892935.us-central1.run.app
  echo.
  echo Next steps:
  echo 1. Open your Google Sheet
  echo 2. Run testEngine^(^) from Apps Script
  echo 3. Check row H - should show 'success'
  echo 4. Videos will start generating
  echo.
) else (
  echo.
  echo ❌ Deployment failed. Check your gcloud setup and try again.
)

pause
