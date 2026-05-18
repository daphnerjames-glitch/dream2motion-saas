import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const MONGODB_URI = process.env.MONGODB_URI;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Webhook endpoint for Stripe events
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db('dream2motion');
      const users = db.collection('users');

      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const videosPerMonth = parseInt(session.metadata.videosPerMonth);

      // Credit amounts for each plan
      const PLAN_CREDITS = {
        starter: 5,
        pro: 20,
        studio: 999999, // Unlimited
      };

      const creditsToAdd = PLAN_CREDITS[plan] || 5;

      // Add credits to user
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $inc: { credits: creditsToAdd },
          $set: {
            plan: plan,
            subscriptionId: session.subscription,
            subscriptionActive: true,
            subscriptionUpdatedAt: new Date(),
          },
        }
      );

      // Store payment record
      const payments = db.collection('payments');
      await payments.insertOne({
        userId: new ObjectId(userId),
        stripeSessionId: session.id,
        stripeSubscriptionId: session.subscription,
        plan: plan,
        amount: session.amount_total / 100, // Convert cents to dollars
        creditsAdded: creditsToAdd,
        status: 'completed',
        createdAt: new Date(),
      });

      await client.close();
      console.log(`Payment processed for user ${userId}: Added ${creditsToAdd} credits for ${plan} plan`);
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  // Handle invoice.payment_succeeded for recurring payments
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    if (invoice.subscription && !invoice.billing_reason.includes('subscription_create')) {
      // This is a recurring payment, not the initial one
      try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db('dream2motion');
        const users = db.collection('users');

        // Get user by subscription ID
        const user = await users.findOne({ subscriptionId: invoice.subscription });
        if (user) {
          const PLAN_CREDITS = {
            starter: 5,
            pro: 20,
            studio: 999999,
          };
          const creditsToAdd = PLAN_CREDITS[user.plan] || 5;

          await users.updateOne(
            { _id: user._id },
            { $inc: { credits: creditsToAdd } }
          );

          console.log(`Recurring payment processed for user ${user._id}: Added ${creditsToAdd} credits`);
        }

        await client.close();
      } catch (error) {
        console.error('Error proc