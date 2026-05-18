import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import fetch from 'node-fetch';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Cost mapping: how many credits each video costs
const VIDEO_COSTS = {
  short: 1,    // 1-2 min
  medium: 3,   // 3-5 min
  long: 8,     // 10+ min
};

// Duration mapping for Replicate (in seconds)
const DURATION_SECONDS = {
  short: 120,   // 2 minutes
  medium: 300,  // 5 minutes
  long: 600,    // 10 minutes
};

async function generateScriptWithGemini(title, description) {
  /**
   * Generate a 20-minute video script using Gemini
   */
  if (!GEMINI_API_KEY) {
    console.log('Gemini not configured, returning basic script');
    return `${title}: ${description}`;
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed 20-minute video script for this premise:
Title: ${title}
Description: ${description}

The script should:
- Be suitable for video narration
- Include scene descriptions
- Specify character actions and dialogue
- Have a clear beginning, middle, and end
- Be engaging and narrative-driven

Generate the full script now:`
          }]
        }]
      }),
    });

    const data = await response.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return script || `${title}: ${description}`;
  } catch (error) {
    console.error('Gemini error:', error);
    return `${title}: ${description}`;
  }
}

async function generateVideoWithReplicate(prompt, duration) {
  /**
   * Generate video using Replicate API
   * Uses Luma Photorealistic Video model
   */
  if (!REPLICATE_API_TOKEN) {
    return {
      status: 'error',
      message: 'Replicate API token not configured',
    };
  }

  try {
    // Start video generation
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a275985f4d430ecee16b130fb1e4ee6f0b36e8bf68e114b79f8b42fc7c7a66e9', // Luma Photorealistic 4K model
        input: {
          prompt: prompt,
          duration: Math.min(DURATION_SECONDS[duration] || 120, 600), // Max 10 min
          aspect_ratio: '16:9',
          loop: false,
        },
      }),
    });

    const prediction = await response.json();

    if (prediction.error) {
      return {
        status: 'error',
        message: `Replicate error: ${prediction.error}`,
      };
    }

    // Return prediction ID for polling
    return {
      status: 'generating',
      predictionId: prediction.id,
      estimatedTime: '2-5 minutes',
    };
  } catch (error) {
    console.error('Replicate error:', error);
    return {
      status: 'error',
      message: `Video generation failed: ${error.message}`,
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { title, description, style, duration } = req.body;

  if (!title || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (!REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN not set');
      return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
    }
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set');
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }
    if (!MONGODB_URI) {
      console.error('MONGODB_URI not set');
      return res.status(500).json({ error: 'MONGODB_URI not configured' });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const users = db.collection('users');
    const videos = db.collection('videos');

    // Get user and check credits
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      await client.close();
      return res.status(404).json({ error: 'User not found' });
    }

    const creditCost = VIDEO_COSTS[duration] || 1;
    const userCredits = user.credits || 0;

    if (userCredits < creditCost) {
      await client.close();
      return res.status(402).json({
        error: 'Insufficient credits',
        creditsNeeded: creditCost,
        creditsAvailable: userCredits,
      });
    }

    // Generate script
    const script = await generateScriptWithGemini(title, description);

    // Generate video with Replicate
    const videoResult = await generateVideoWithReplicate(script, duration);

    if (videoResult.status === 'error') {
      await client.close();
      return res.status(500).json(videoResult);
    }

    // Deduct credits
    await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $inc: { credits: -creditCost } }
    );

    // Store video record
    const videoRecord = await videos.insertOne({
      userId: new ObjectId(decoded.userId),
      title,
      description,
      script,
      style: style || 'realistic',
      duration,
      creditCost,
      replicatePredictionId: videoResult.predictionId,
      videoUrl: null,
      status: 'generating',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await client.close();

    return res.status(201).json({
      videoId: videoRecord.insertedId,
      status: 'generating',
      predictionId: videoResult.predictionId,
      message: 'Video generation started - this may take 2-5 minutes',
      creditsCost: creditCost,
      creditsRemaining: userCredits - creditCost,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate video',
      details: error.message,
    });
  }
}
