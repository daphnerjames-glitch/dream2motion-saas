import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

const STRIPE_PRODUCTS = {
  starter: {
    name: 'Starter',
    price: 900, // $9 in cents
    videos: 5,
    duration: 'short',
  },
  pro: {
    name: 'Pro',
    price: 2900, // $29 in cents
    videos: 20,
    duration: 'medium',
  },
  studio: {
    name: 'Studio',
    price: 7900, // $79 in cents
    videos: 'unlimited',
    duration: 'long',
  },
};

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

  const { plan } = req.body;

  if (!STRIPE_PRODUCTS[plan]) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('dream2motion');
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      await client.close();
      return res.status(404).json({ error: 'User not found' });
    }

    const planInfo = STRIPE_PRODUCTS[plan];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: decoded.userId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Dream2Motion ${planInfo.name}`,
              description: `${planInfo.videos} videos per month`,
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
            unit_amount: planInfo.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}/pricing?cancelled=true`,
      metadata: {
        userId: decoded.userId,
        plan: plan,
        videosPerMonth: planInfo.videos,
      },
    });

    await client.close();

    return res.status(200).json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
