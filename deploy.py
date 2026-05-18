#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

# Ensure requirements.txt exists in Brain folder
req_src = "/sessions/quirky-admiring-shannon/mnt/outputs/requirements.txt"
req_dst = "/sessions/quirky-admiring-shannon/mnt/Brain/requirements.txt"

if os.path.exists(req_src):
    shutil.copy2(req_src, req_dst)
    print(f"✓ requirements.txt copied to Brain folder")
else:
    print(f"ERROR: requirements.txt not found at {req_src}")
    sys.exit(1)

# Verify all needed files exist
files_needed = ["main.py", "requirements.txt", "Dockerfile"]
for f in files_needed:
    path = f"/sessions/quirky-admiring-shannon/mnt/Brain/{f}"
    if not os.path.exists(path):
        print(f"ERROR: {f} not found")
        sys.exit(1)
    print(f"✓ {f} exists")

print("\nAll files ready for deployment.")
print("Now, deploy with one of these commands:")
print("1. Using gcloud: gcloud run deploy autonomous-income-engine --source . --region us-central1")
print("2. Or navigate to Cloud Run in the console and deploy manually with these files")
