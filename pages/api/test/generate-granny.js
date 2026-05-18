import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';

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

async function fetchGrannyEpisodes() {
  try {
    const response = await fetch('/api/granny/episodes');
    const data = await response.json();
    return data.episodes || [];
  } catch (error) {
    console.error('Error fetching Granny episodes:', error);
    return [];
  }
}

async function generateScriptWithGemini(title, premise) {
  if (!GEMINI_API_KEY) {
    console.log('Gemini not configured, returning basic script');
    return `${title}: ${premise}`;
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed video script for this Granny episode:
Title: ${title}
Premise: ${premise}

The script should:
- Be suitable for video narration
- Include scene descriptions
- Specify character actions and dialogue
- Have a clear beginning, middle, and end
- Be engaging and narrative-driven
- Feature "Granny" as the main character

Generate the full script now:`
          }]
        }]
      }),
    });

    const data = await response.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return script || `${title}: ${premise}`;
  } catch (error) {
    console.error('Gemini error:', error);
    return `${title}: ${premise}`;
  }
}

async function generateVideoWithReplicate(prompt) {
  if (!REPLICATE_API_TOKEN) {
    return {
      status: 'error',
      message: 'Replicate API token not configured',
    };
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a275985f4d430ecee16b130fb1e4ee6f0b36e8bf68e114b79f8b42fc7c7a66e9',
        input: {
          prompt: prompt,
          duration: 120, // 2 minutes
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

  try {
    // Fetch Granny episodes
    const episodes = await fetchGrannyEpisodes();
    if (episodes.length === 0) {
      return res.status(400).json({ error: 'No Granny episodes found' });
    }

    // Use the first episode (most recent)
    const episode = episodes[0];

    // Generate script
    const script = await generateScriptWithGemini(episode.title, episode.premise);

    // Generate video
    const videoResult = await generateVideoWithReplicate(script);

    if (videoResult.status === 'error') {
      return res.status(500).json(videoResult);
    }

    // Save to database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const videos = db.collection('videos');

    const videoRecord = await videos.insertOne({
      userId: new ObjectId(decoded.userId),
      title: `Granny: ${episode.title}`,
      description: episode.premise,
      script,
      style: 'realistic',
      duration: 'short',
      creditCost: 1,
      replicatePredictionId: videoResult.predictionId,
      videoUrl: null,
      status: 'generating',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await client.close();

    return res.status(201).json({
      videoId: videoRecord.insertedId,
      episode: episode,
      status: 'generating',
      predictionId: videoResult.predictionId,
      message: `Started generating Granny episode: "${episode.title}"`,
    });
  } catch (error) {
    console.error('Test video generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate test video',
      details: error.message,
    });
  }
}
