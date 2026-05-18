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

  const { credits } = req.body;

  if (!credits || credits < 1) {
    return res.status(400).json({ error: 'Invalid credits amount' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const users = db.collection('users');

    const result = await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $inc: { credits: credits } }
    );

    await client.close();

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: `Added ${credits} credits`,
      creditsAdded: credits,
    });
  } catch (error) {
    console.error('Add credits error:', error);
    return res.status(500).json({
      error: 'Failed to add credits',
      details: error.message,
    });
  }
}
