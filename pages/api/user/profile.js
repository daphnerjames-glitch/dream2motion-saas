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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('dream2motion');
      const users = db.collection('users');

      const user = await users.findOne({ _id: new ObjectId(decoded.userId) });

      await client.close();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        plan: user.plan,
        credits: user.credits,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else if (req.method === 'PUT') {
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Missing displayName' });
    }

    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('dream2motion');
      const users = db.collection('users');

      const result = await users.updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: {
            displayName,
            updatedAt: new Date(),
          },
        }
      );

      await client.close();

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
