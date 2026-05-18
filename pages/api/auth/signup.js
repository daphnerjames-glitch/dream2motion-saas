import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const users = db.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      await client.close();
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await users.insertOne({
      email,
      passwordHash: hashedPassword,
      displayName,
      plan: 'free',
      credits: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: result.insertedId, email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    await client.close();

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        email,
        displayName,
        plan: 'free',
        credits: 5,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
