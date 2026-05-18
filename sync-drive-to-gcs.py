#!/usr/bin/env python3
"""
Sync images from Google Drive folder to Google Cloud Storage
"""
import os
import io
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.auth.oauthlib.flow import InstalledAppFlow
from google.auth import default
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.cloud import storage

# Configuration
DRIVE_FOLDER_ID = "1XHTqSTwfP3SBzGc8fCnZCQK_sndrdtdw"  # AI_GRANNY images
GCS_BUCKET = "run-sources-autonomous-income-engine-us-central1"
GCS_FOLDER = "granny-images"

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def get_drive_service():
    """Get authenticated Google Drive service"""
    creds = None

    # Try to use application default credentials first
    try:
        creds, _ = default()
        return build('drive', 'v3', credentials=creds)
    except:
        pass

    # Fall back to OAuth flow
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def list_folder_images(drive_service, folder_id):
    """List all image files in a Drive folder"""
    query = f"'{folder_id}' in parents and trashed=false and mimeType contains 'image/'"
    results = drive_service.files().list(
        q=query,
        spaces='drive',
        fields='files(id, name, mimeType)',
        pageSize=100
    ).execute()

    return results.get('files', [])

def download_from_drive(drive_service, file_id, file_name):
    """Download file from Drive to memory"""
    request = drive_service.files().get_media(fileId=file_id)
    file_obj = io.BytesIO()
    downloader = MediaIoBaseDownload(file_obj, request)

    done = False
    while not done:
        _, done = downloader.next_chunk()

    file_obj.seek(0)
    return file_obj.getvalue()

def upload_to_gcs(bucket_name, folder_name, file_name, file_content):
    """Upload file to Google Cloud Storage"""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(f"{folder_name}/{file_name}")

    blob.upload_from_string(file_content)
    print(f"✓ Uploaded {file_name} to gs://{bucket_name}/{folder_name}/{file_name}")

def main():
    print("Connecting to Google Drive...")
    drive_service = get_drive_service()

    print(f"Listing images in folder {DRIVE_FOLDER_ID}...")
    files = list_folder_images(drive_service, DRIVE_FOLDER_ID)

    if not files:
        print("No images found in folder")
        return

    print(f"Found {len(files)} images. Starting sync to Cloud Storage...\n")

    for file in files:
        file_id = file['id']
        file_name = file['name']

        print(f"Downloading {file_name}...")
        content = download_from_drive(drive_service, file_id, file_name)

        print(f"Uploading {file_name} to GCS...")
        upload_to_gcs(GCS_BUCKET, GCS_FOLDER, file_name, content)

    print(f"\n✓ Sync complete! Images available at gs://{GCS_BUCKET}/{GCS_FOLDER}/")

if __name__ == '__main__':
    main()
