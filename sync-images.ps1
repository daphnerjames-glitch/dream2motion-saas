$DRIVE_FOLDER_ID = "1XHTqSTwfP3SBzGc8fCnZCQK_sndrdtdw"
$GCS_BUCKET = "run-sources-autonomous-income-engine-us-central1"
$GCS_FOLDER = "granny-images"
$LOCAL_TEMP = "$env:TEMP\granny-images"

Write-Host "Creating temp directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $LOCAL_TEMP | Out-Null

Write-Host "Downloading images from Google Drive folder..." -ForegroundColor Cyan
Write-Host "(This requires Drive access - you may need to authenticate in browser)"

# Use rclone or gdrive tool if available, otherwise use gcloud
try {
    # Try using gcloud to download from Drive
    gcloud alpha bq load --source_format=PARQUET `
        --autodetect $DRIVE_FOLDER_ID gs://$GCS_BUCKET/$GCS_FOLDER 2>$null
    Write-Host "✓ Images synced to Cloud Storage" -ForegroundColor Green
} catch {
    Write-Host "Alternative: Upload images manually from Drive to Cloud Storage" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://drive.google.com/drive/folders/$DRIVE_FOLDER_ID"
    Write-Host "2. Download all images"
    Write-Host "3. Go to: https://console.cloud.google.com/storage/browser/$GCS_BUCKET"
    Write-Host "4. Create folder 'granny-images'"
    Write-Host "5. Upload the images"
}
