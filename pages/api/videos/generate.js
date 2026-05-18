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

  const { title, description, style, duration, input } = req.body;

  if (!title || !style || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const videos = db.collection('videos');

    const result = await videos.insertOne({
      userId: new ObjectId(decoded.userId),
      title,
      description: description || '',
      style,
      duration,
      input: input || {},
      videoUrl: null,
      thumbnail: null,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await client.close();

    return res.status(201).json({
      videoId: result.insertedId,
      status: 'processing',
    });
  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
