import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.query;

    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('dream2motion');
      const videos = db.collection('videos');

      const video = await videos.findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(decoded.userId),
      });

      await client.close();

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      return res.status(200).json({
        id: video._id,
        title: video.title,
        description: video.description,
        style: video.style,
        duration: video.duration,
        videoUrl: video.videoUrl,
        thumbnail: video.thumbnail,
        status: video.status,
        createdAt: video.createdAt,
      });
    } catch (error) {
      console.error('Get video error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.query;

    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('dream2motion');
      const videos = db.collection('videos');

      const result = await videos.deleteOne({
        _id: new ObjectId(id),
        userId: new ObjectId(decoded.userId),
      });

      await client.close();

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }

      return res.status(200).json({ message: 'Video deleted' });
    } catch (error) {
      console.error('Delete video error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
