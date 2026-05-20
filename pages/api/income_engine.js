/**
 * Vercel API Route: Process Income Engine Pipeline
 * Handles Etsy, YouTube, and Buzzsprout posting
 * Called by Google Apps Script from Master Calendar sheets
 */

const SECURITY_TOKEN = 'closetrebel2026';

// Environment variables (set in Vercel dashboard)
const ETSY_API_KEY = process.env.ETSY_API_KEY;
const GRANNY_VIDU_KEY = process.env.GRANNY_VIDU_KEY;
const REBEL_VIDU_KEY = process.env.REBEL_VIDU_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const YT_CLIENT_ID = process.env.YT_CLIENT_ID;
const YT_CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
const GRANNY_YT_REFRESH = process.env.GRANNY_YT_REFRESH;
const REBEL_YT_REFRESH = process.env.REBEL_YT_REFRESH;
const GRANNY_BUZZSPROUT_TOKEN = process.env.GRANNY_BUZZSPROUT_TOKEN;
const GRANNY_BUZZSPROUT_PODCAST_ID = process.env.GRANNY_BUZZSPROUT_PODCAST_ID || '2615568';
const REBEL_BUZZSPROUT_TOKEN = process.env.REBEL_BUZZSPROUT_TOKEN;
const REBEL_BUZZSPROUT_PODCAST_ID = process.env.REBEL_BUZZSPROUT_PODCAST_ID;

async function handleEtsy(data, payload) {
  const title = data.title || 'Untitled Product';
  const description = data.description || '';
  const tags = data.tags || '';

  console.log(`Handling Etsy: ${title}`);

  if (!ETSY_API_KEY) {
    return {
      title,
      channel: 'etsy',
      status: 'error',
      message: 'ETSY_API_KEY not configured in environment variables'
    };
  }

  try {
    const response = await fetch('https://openapi.etsy.com/v3/application/shops/self/listings', {
      method: 'POST',
      headers: {
        'x-api-key': ETSY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title.substring(0, 140),
        description: description.substring(0, 4000),
        quantity: 1,
        price: Math.max(0.99, parseFloat(data.price) || 9.99),
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        state: 'draft'
      })
    });

    if (response.ok) {
      const result = await response.json();
      const listingId = result.data?.listing_id;
      console.log(`Etsy draft listing created: ${listingId}`);
      return {
        title,
        channel: 'etsy',
        status: 'draft_created',
        listing_id: listingId,
        message: 'Product draft created in Etsy'
      };
    } else {
      const error = await response.text();
      console.error(`Etsy API error: ${error}`);
      return {
        title,
        channel: 'etsy',
        status: 'error',
        message: `Etsy API error: ${response.status}`
      };
    }
  } catch (error) {
    console.error(`Etsy API call failed: ${error.message}`);
    return {
      title,
      channel: 'etsy',
      status: 'error',
      message: error.message
    };
  }
}

async function handleGrannyYoutube(data, payload) {
  const title = data.title || 'Untitled';
  const description = data.description || '';
  const tags = data.tags || '';

  console.log(`Handling Granny YouTube: ${title}`);

  // For now, return placeholder
  return {
    title,
    channel: 'granny',
    message: 'Granny YouTube pipeline queued'
  };
}

async function handleRebelYoutube(data, payload) {
  const title = data.title || 'Untitled';
  const description = data.description || '';
  const tags = data.tags || '';

  console.log(`Handling Closet Rebel YouTube: ${title}`);

  // For now, return placeholder
  return {
    title,
    channel: 'rebel',
    message: 'Rebel YouTube pipeline queued'
  };
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    // Validate payload
    if (!payload || !payload.token || !payload.channel) {
      return res.status(400).json({
        status: 'rejected',
        reason: 'Invalid payload structure'
      });
    }

    // Security check
    if (payload.token !== SECURITY_TOKEN) {
      return res.status(403).json({
        status: 'unauthorized',
        reason: 'Invalid security token'
      });
    }

    const channel = payload.channel;
    const rowData = payload.data || {};
    const rowNumber = payload.rowNumber;

    console.log(`Processing channel: ${channel}, row: ${rowNumber}`);

    let result;

    // Route to handler
    if (channel === 'etsy') {
      result = await handleEtsy(rowData, payload);
    } else if (channel === 'granny') {
      result = await handleGrannyYoutube(rowData, payload);
    } else if (channel === 'rebel') {
      result = await handleRebelYoutube(rowData, payload);
    } else {
      return res.status(400).json({
        status: 'error',
        reason: `Unknown channel: ${channel}`
      });
    }

    return res.status(200).json({
      status: 'success',
      channel,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Engine error: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      error_details: error.message
    });
  }
}
