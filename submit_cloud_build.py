#!/usr/bin/env python3
"""
Submit a Cloud Build job to build and deploy the autonomous-income-engine.
This uses the Cloud Build API via HTTP.
"""

import os
import sys
import json
import subprocess
import tarfile
from pathlib import Path

PROJECT_ID = "autonomous-income-engine"
REGION = "us-central1"
SERVICE_NAME = "autonomous-income-engine"

# Create source archive
print("Creating source archive...")
src_dir = "/sessions/quirky-admiring-shannon/mnt/Brain"
archive_path = "/tmp/source.tar.gz"

with tarfile.open(archive_path, "w:gz") as tar:
    tar.add(src_dir, arcname=".", filter=lambda x: (x.mode |= 0o644, x)[1] if x.isfile() else x)

print(f"Archive created: {archive_path}")
print(f"Archive size: {os.path.getsize(archive_path)} bytes")

# Read and encode the source
with open(archive_path, "rb") as f:
    source_data = f.read()

# Create Cloud Build request
build_request = {
    "source": {
        "storageSource": {
            "bucket": f"gs://{PROJECT_ID}_cloudbuild",
            "object": "source.tar.gz"
        }
    },
    "steps": [
        {
            "name": "gcr.io/cloud-builders/docker",
            "args": [
                "build",
                "-t",
                f"gcr.io/{PROJECT_ID}/{SERVICE_NAME}:latest",
                "."
            ]
        },
        {
            "name": "gcr.io/cloud-builders/docker",
            "args": [
                "push",
                f"gcr.io/{PROJECT_ID}/{SERVICE_NAME}:latest"
            ]
        },
        {
            "name": "gcr.io/cloud-builders/gke-deploy",
            "args": [
                "run",
                f"--filename=.",
                f"--image=gcr.io/{PROJECT_ID}/{SERVICE_NAME}:latest",
                f"--location={REGION}",
                "--namespace=default"
            ]
        }
    ],
    "images": [
        f"gcr.io/{PROJECT_ID}/{SERVICE_NAME}:latest"
    ]
}

print("\nBuild configuration:")
print(json.dumps(build_request, indent=2))

print("\n" + "="*60)
print("Next steps:")
print("1. Upload the source archive to Cloud Storage:")
print(f"   gsutil cp {archive_path} gs://{PROJECT_ID}_cloudbuild/source.tar.gz")
print("\n2. Submit the build to Cloud Build:")
print(f"   gcloud builds submit --config=cloudbuild.yaml")
print("\n3. Or use the Cloud Console to deploy manually")
print("="*60)
