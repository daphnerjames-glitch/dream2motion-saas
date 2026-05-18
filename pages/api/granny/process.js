const CLOUD_FUNCTION_URL = 'https://autonomous-income-engine-260985892935.us-central1.run.app/process_income_engine_pipeline';
const SECURITY_TOKEN = 'closetrebel2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, data, rowNumber, channel } = req.body;

  // Verify security token from Apps Script
  if (token !== SECURITY_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (channel !== 'granny') {
    return res.status(400).json({ error: 'Invalid channel' });
  }

  try {
    console.log(`Processing Granny episode: ${data.title}`);

    // Send to Cloud Function for video generation
    const payload = {
      token: SECURITY_TOKEN,
      timestamp: new Date().toISOString(),
      channel: 'granny',
      rowNumber: rowNumber,
      data: data,
    };

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Cloud function failed',
        status: response.status
      });
    }

    const result = await response.json();

    return res.status(200).json({
      message: 'Video generation started',
      result: result,
      rowNumber: rowNumber
    });
  } catch (error) {
    console.error('Error processing Granny episode:', error);
    return res.status(500).json({
      error: 'Failed to process',
      details: error.message
    });
  }
}
