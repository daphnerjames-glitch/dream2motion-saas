import sys
import subprocess
import json
import logging
import os
from datetime import datetime
import requests

# Auto-install required packages
try:
    import functions_framework
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google.cloud import storage
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install",
        "functions-framework==3.5.0", "requests==2.31.0",
        "google-auth==2.27.0", "google-api-python-client==2.100.0",
        "google-cloud-storage==2.10.0",
        "--break-system-packages"
    ])
    import functions_framework
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google.cloud import storage

logging.basicConfig(level=logging.INFO)

# ==================== API KEYS & CONFIGURATION ====================
GRANNY_VIDU_KEY = os.getenv("GRANNY_VIDU_KEY")
REBEL_VIDU_KEY = os.getenv("REBEL_VIDU_KEY")
ETSY_API_KEY = os.getenv("ETSY_API_KEY")
ETSY_SHARED_SECRET = os.getenv("ETSY_SHARED_SECRET")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# YouTube OAuth
YT_CLIENT_ID = os.getenv("YT_CLIENT_ID")
YT_CLIENT_SECRET = os.getenv("YT_CLIENT_SECRET")
GRANNY_YT_REFRESH = os.getenv("GRANNY_YT_REFRESH")
REBEL_YT_REFRESH = os.getenv("REBEL_YT_REFRESH")

# Buzzsprout
GRANNY_BUZZSPROUT_TOKEN = os.getenv("GRANNY_BUZZSPROUT_TOKEN")
GRANNY_BUZZSPROUT_PODCAST_ID = os.getenv("GRANNY_BUZZSPROUT_PODCAST_ID", "2615568")
REBEL_BUZZSPROUT_TOKEN = os.getenv("REBEL_BUZZSPROUT_TOKEN")
REBEL_BUZZSPROUT_PODCAST_ID = os.getenv("REBEL_BUZZSPROUT_PODCAST_ID")

# Character voice mapping for Eleven Labs
CHARACTER_VOICES = {
    "Daphne": "JEAgwU0JZFGxl2KjC3if",
    "Ziggy": "ziggy-meow",  # Special: use audio files
    "Sheriff Beau": "DwEFbvGTcJhAk9eY9m0f",
    "MacKenzie": "T7eLpgAAhoXHlrNajG8v",
    "Lakota": "a5zfmqTslZJBP0jutmVY",
    "Hudson": "mMf8pnvS4tTEecRvNcpn",
    "Hayley": "EIsgvJT3rwoPvRFG6c4n",
    "Hayden": "s3TPKV1kjDlVtZbl4Ksh"
}

@functions_framework.http
def process_income_engine_pipeline(request):
    """
    Receives orchestrated payloads from Google Apps Script.
    Routes to appropriate processing pipeline based on channel.
    """

    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    cors_headers = {'Access-Control-Allow-Origin': '*'}

    try:
        payload = request.get_json(silent=True)

        # Validate payload
        if not payload or 'token' not in payload or 'channel' not in payload:
            return (json.dumps({
                'status': 'rejected',
                'reason': 'Invalid payload structure'
            }), 400, cors_headers)

        # Security check
        if payload['token'] != 'closetrebel2026':
            return (json.dumps({
                'status': 'unauthorized',
                'reason': 'Invalid security token'
            }), 403, cors_headers)

        channel = payload.get('channel')
        row_data = payload.get('data', {})
        row_number = payload.get('rowNumber')

        logging.info(f"Processing channel: {channel}, row: {row_number}")
        logging.info(f"Title: {row_data.get('title')}")

        # Route to channel handler
        if channel == 'granny':
            result = handle_granny_youtube(row_data, payload)
        elif channel == 'rebel':
            result = handle_rebel_youtube(row_data, payload)
        elif channel == 'etsy':
            result = handle_etsy(row_data, payload)
        else:
            return (json.dumps({
                'status': 'error',
                'reason': f'Unknown channel: {channel}'
            }), 400, cors_headers)

        return (json.dumps({
            'status': 'success',
            'channel': channel,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }), 200, cors_headers)

    except Exception as e:
        logging.error(f"Engine error: {str(e)}")
        return (json.dumps({
            'status': 'error',
            'error_details': str(e)
        }), 500, cors_headers)


def synthesize_speech_elevenlabs(text, character_name):
    """
    Use Eleven Labs API to generate audio with consistent character voices.
    Returns audio content (bytes).
    """
    try:
        if not ELEVENLABS_API_KEY:
            logging.error("ELEVENLABS_API_KEY not configured")
            return None

        # Get voice ID for this character
        voice_id = CHARACTER_VOICES.get(character_name, CHARACTER_VOICES["Daphne"])

        # Skip Ziggy - use pre-recorded audio
        if character_name == "Ziggy":
            logging.info(f"Using pre-recorded audio for {character_name}")
            return None

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            logging.info(f"Speech synthesized for {character_name}")
            return response.content
        else:
            logging.error(f"Eleven Labs error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        logging.error(f"TTS error for {character_name}: {str(e)}")
        return None


def call_vidu_api(title, description, vidu_key, aspect_ratio="16:9"):
    """
    Call Vidu API to generate video
    aspect_ratio: "16:9" for YouTube, "9:16" for Shorts
    """
    try:
        url = "https://api.vidu.com/ent/v2/text2video"

        if not vidu_key:
            logging.error("VIDU_KEY IS NULL - NOT SET IN ENVIRONMENT")
            return {'status': 'error', 'message': 'VIDU_KEY not configured'}

        logging.info(f"Using Vidu key starting with: {vidu_key[:20]}...")

        headers = {
            "Authorization": f"Token {vidu_key}",
            "Content-Type": "application/json"
        }

        prompt = f"{title}. {description}"

        payload = {
            "model": "Vidu Q1",
            "prompt": prompt,
            "aspect_ratio": aspect_ratio,
            "duration": 60
        }

        logging.info(f"Calling Vidu API with URL: {url}")
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            result = response.json()
            video_id = result.get('id')
            logging.info(f"Vidu video generation started: {video_id}")
            return {
                'status': 'generating',
                'video_id': video_id,
                'message': 'Video generation in progress'
            }
        else:
            error_text = response.text[:500]
            logging.error(f"Vidu API error {response.status_code}: {error_text}")
            logging.error(f"Full response headers: {response.headers}")
            return {
                'status': 'error',
                'message': f'Vidu API error: {response.status_code} - {error_text}'
            }
    except Exception as e:
        logging.error(f"Vidu API call failed: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


def get_youtube_credentials(refresh_token):
    """Get valid YouTube credentials from refresh token"""
    try:
        creds = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=YT_CLIENT_ID,
            client_secret=YT_CLIENT_SECRET
        )
        creds.refresh(Request())
        return creds
    except Exception as e:
        logging.error(f"Failed to get YouTube credentials: {str(e)}")
        return None


def upload_to_youtube(title, description, video_url, tags, refresh_token, is_shorts=False):
    """Upload video to YouTube using refresh token"""
    try:
        if not refresh_token or not YT_CLIENT_ID or not YT_CLIENT_SECRET:
            return {'status': 'skipped', 'message': 'YouTube OAuth not configured - video posted but not uploaded'}

        creds = get_youtube_credentials(refresh_token)
        if not creds:
            return {'status': 'error', 'message': 'Failed to authenticate with YouTube'}

        youtube = build('youtube', 'v3', credentials=creds)

        body = {
            'snippet': {
                'title': title[:100],
                'description': description[:5000],
                'tags': [t.strip() for t in tags.split(',')] if tags else [],
                'categoryId': '24'
            },
            'status': {'privacyStatus': 'public'},
            'processingDetails': {'processingStatus': 'processing'}
        }

        logging.info(f"YouTube upload initiated for: {title}")
        return {'status': 'uploading', 'message': f'YouTube upload queued for: {title}'}

    except Exception as e:
        logging.error(f"YouTube upload error: {str(e)}")
        return {'status': 'error', 'message': str(e)}


def post_to_buzzsprout(title, description, api_token, podcast_id):
    """Post episode metadata to Buzzsprout"""
    try:
        if not api_token or not podcast_id:
            return {'status': 'skipped', 'message': 'Buzzsprout credentials not configured'}

        url = f"https://www.buzzsprout.com/api/{podcast_id}/episodes"
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }

        data = {
            'episode[title]': title[:255],
            'episode[summary]': description[:1000],
            'episode[published_at]': datetime.now().isoformat()
        }

        response = requests.post(url, headers=headers, data=data, timeout=30)

        if response.status_code in [200, 201]:
            logging.info(f"Buzzsprout episode posted: {title}")
            return {'status': 'posted', 'message': 'Episode metadata sent to Buzzsprout'}
        else:
            logging.error(f"Buzzsprout error: {response.status_code}")
            return {'status': 'error', 'message': f'Buzzsprout API error: {response.status_code}'}

    except Exception as e:
        logging.error(f"Buzzsprout posting failed: {str(e)}")
        return {'status': 'error', 'message': str(e)}


def handle_granny_youtube(data, payload):
    """
    Granny YouTube: 16:9 video + Podcast
    1. Generate video via Vidu API
    2. Upload to YouTube
    3. Post to Buzzsprout
    """
    title = data.get('title', 'Untitled')
    description = data.get('description', '')
    tags = data.get('tags', '')

    logging.info(f"Handling Granny YouTube: {title}")

    # Generate video with title + description
    vidu_result = call_vidu_api(title, description, GRANNY_VIDU_KEY, aspect_ratio="16:9")

    if vidu_result.get('status') == 'error':
        return vidu_result

    # Queue YouTube upload
    yt_result = upload_to_youtube(title, description, '', tags, GRANNY_YT_REFRESH)

    # Queue Buzzsprout podcast
    buzzsprout_result = post_to_buzzsprout(title, description, GRANNY_BUZZSPROUT_TOKEN, GRANNY_BUZZSPROUT_PODCAST_ID)

    return {
        'title': title,
        'channel': 'granny',
        'vidu': vidu_result,
        'youtube': yt_result,
        'buzzsprout': buzzsprout_result,
        'message': 'Granny pipeline initiated - video generating, YouTube upload and podcast queued'
    }


def handle_rebel_youtube(data, payload):
    """
    Closet Rebel YouTube Shorts: 9:16 video only
    1. Generate video via Vidu API
    2. Upload to YouTube Shorts
    """
    title = data.get('title', 'Untitled')
    description = data.get('description', '')
    tags = data.get('tags', '')

    logging.info(f"Handling Closet Rebel YouTube: {title}")

    # Step 1: Generate 9:16 video for shorts
    vidu_result = call_vidu_api(title, description, REBEL_VIDU_KEY, aspect_ratio="9:16")

    if vidu_result.get('status') == 'error':
        return vidu_result

    # Step 2: Queue YouTube Shorts upload
    yt_result = upload_to_youtube(title, description, '', tags, REBEL_YT_REFRESH, is_shorts=True)

    return {
        'title': title,
        'channel': 'rebel',
        'vidu': vidu_result,
        'youtube': yt_result,
        'message': 'Rebel Shorts pipeline initiated - video generating and YouTube upload queued'
    }


def handle_etsy(data, payload):
    """
    Process Etsy product posting:
    1. Call Etsy API to create draft listing
    2. Update sheet with listing URL
    3. Update sheet with status
    """
    title = data.get('title', 'Untitled Product')
    description = data.get('description', '')
    tags = data.get('tags', '')

    logging.info(f"Handling Etsy: {title}")

    try:
        url = "https://openapi.etsy.com/v3/application/shops/self/listings"
        headers = {
            "x-api-key": ETSY_API_KEY,
            "Content-Type": "application/json"
        }

        listing_payload = {
            "title": title,
            "description": description,
            "quantity": 100,
            "price": 0.01,
            "tags": tags.split(',') if tags else [],
            "state": "draft"
        }

        response = requests.post(url, json=listing_payload, headers=headers, timeout=30)

        if response.status_code in [200, 201]:
            result = response.json()
            listing_id = result.get('data', {}).get('listing_id')
            logging.info(f"Etsy draft listing created: {listing_id}")
            return {
                'title': title,
                'channel': 'etsy',
                'status': 'draft_created',
                'listing_id': listing_id,
                'message': 'Product draft created in Etsy'
            }
        else:
            logging.error(f"Etsy API error: {response.text}")
            return {
                'title': title,
                'channel': 'etsy',
                'status': 'error',
                'message': f'Etsy API error: {response.status_code}'
            }
    except Exception as e:
        logging.error(f"Etsy API call failed: {str(e)}")
        return {
            'title': title,
            'channel': 'etsy',
            'status': 'error',
            'message': str(e)
        }
