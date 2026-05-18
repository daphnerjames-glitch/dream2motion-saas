# Verify Cloud Run Deployment Status
# Run this AFTER deployment to confirm everything is working

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "autonomous-income-engine"
$SERVICE_NAME = "autonomous-income-engine"
$REGION = "us-central1"

# Check if service exists and get status
Write-Host "Checking Cloud Run service status..." -ForegroundColor Yellow

try {
    $service_info = gcloud run services describe $SERVICE_NAME `
        --region=$REGION `
        --project=$PROJECT_ID `
        --format=json 2>&1 | ConvertFrom-Json

    Write-Host "✓ Service found: $SERVICE_NAME" -ForegroundColor Green

    $service_url = $service_info.status.url
    Write-Host "  URL: $service_url" -ForegroundColor White

    $status = $service_info.status.conditions[0].status
    if ($status -eq "True") {
        Write-Host "  Status: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "  Status: NOT READY" -ForegroundColor Yellow
    }

    # Show recent revisions
    Write-Host ""
    Write-Host "Recent revisions:" -ForegroundColor Yellow
    $revisions = gcloud run revisions list `
        --service=$SERVICE_NAME `
        --region=$REGION `
        --project=$PROJECT_ID `
        --limit=3 `
        --format="table(name,status,created)"

    Write-Host $revisions

} catch {
    Write-Host "✗ Service not found or error accessing it" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Exit 1
}

Write-Host ""
Write-Host "Checking secrets..." -ForegroundColor Yellow

$secret_names = @("YT_CLIENT_ID", "YT_CLIENT_SECRET", "GRANNY_YT_REFRESH", "REBEL_YT_REFRESH", "GRANNY_BUZZSPROUT_TOKEN", "REBEL_BUZZSPROUT_TOKEN")

foreach ($secret in $secret_names) {
    try {
        $secret_info = gcloud secrets describe $secret `
            --project=$PROJECT_ID 2>&1
        Write-Host "  ✓ $secret exists" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $secret NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed (✓), your deployment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Test by running testEngine() in your Google Sheet" -ForegroundColor White
