import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId parameter' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const videos = db.collection('videos');

    // Get video record
    const video = await videos.findOne({ _id: new ObjectId(videoId) });

    if (!video) {
      await client.close();
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user owns this video
    if (video.userId.toString() !== decoded.userId) {
      await client.close();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If video is already completed, return it
    if (video.status === 'completed' && video.videoUrl) {
      await client.close();
      return res.status(200).json({
        videoId: video._id,
        status: 'completed',
        videoUrl: video.videoUrl,
        title: video.title,
      });
    }

    // Check Replicate API for prediction status
    if (!video.replicatePredictionId) {
      await client.close();
      return res.status(200).json({
        videoId: video._id,
        status: 'error',
        message: 'No prediction ID found',
      });
    }

    const replicateUrl = `https://api.replicate.com/v1/predictions/${video.replicatePredictionId}`;
    const predictionResponse = await fetch(replicateUrl, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const prediction = await predictionResponse.json();

    // Update video status based on prediction
    if (prediction.status === 'succeeded' && prediction.output) {
      const videoUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      // Update video record with URL
      await videos.updateOne(
        { _id: new ObjectId(videoId) },
        {
          $set: {
            status: 'completed',
            videoUrl: videoUrl,
            updatedAt: new Date(),
          },
        }
      );

      await client.close();

      return res.status(200).json({
        videoId: video._id,
        status: 'completed',
        videoUrl: videoUrl,
        title: video.title,
      });
    } else if (prediction.status === 'failed') {
      // Update video record with error
      await videos.updateOne(
        { _id: new ObjectId(videoId) },
        {
          $set: {
            status: 'error',
            errorMessage: prediction.error || 'Video generation failed',
            updatedAt: new Date(),
          },
        }
      );

      await client.close();

      return res.status(200).json({
        videoId: video._id,
        status: 'error',
        message: prediction.error || 'Video generation failed',
      });
    } else if (prediction.status === 'processing') {
      await client.close();

      return res.status(200).json({
        videoId: video._id,
        status: 'generating',
        progress: prediction.metrics?.predict_time || null,
        message: 'Video is being generated...',
      });
    }

    await client.close();

    return res.status(200).json({
      videoId: video._id,
      status: prediction.status || 'unknown',
      message: 'Checking video generation status',
    });
  } catch (error) {
    console.error('Video status check error:', error);
    return res.status(500).json({
      error: 'Failed to check video status',
      details: error.message,
    });
  }
}
