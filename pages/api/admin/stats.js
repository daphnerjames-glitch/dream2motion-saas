import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

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

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');

    const users = db.collection('users');
    const videos = db.collection('videos');
    const subscriptions = db.collection('subscriptions');

    const totalUsers = await users.countDocuments();
    const totalVideos = await videos.countDocuments();
    const activeSubscriptions = await subscriptions.countDocuments({
      status: 'active',
    });

    await client.close();

    return res.status(200).json({
      totalUsers,
      totalVideos,
      activeSubscriptions,
      totalRevenue: 0, // Placeholder
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
