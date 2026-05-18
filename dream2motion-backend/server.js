const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const Stripe = require('stripe');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Replicate = require('replicate');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware: Verify JWT
const verifyAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    // Create JWT token
    const token = jwt.sign({ id: data[0].id, email }, jwtSecret);
    res.json({ token, user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user from Supabase
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error) return res.status(401).json({ error: 'Invalid credentials' });

    // Compare passwords
    const validPassword = await bcrypt.compare(password, data.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT token
    const token = jwt.sign({ id: data.id, email }, jwtSecret);
    res.json({ token, user: { id: data.id, email, name: data.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Project Routes
app.get('/api/projects', verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select()
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', verifyAuth, async (req, res) => {
  const { title, description, channel_type, characters, music_enabled } = req.body;

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        user_id: req.user.id,
        title,
        description,
        channel_type,
        characters,
        music_enabled,
        status: 'draft',
        created_at: new Date()
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Video Generation Route
app.post('/api/generate-video', verifyAuth, async (req, res) => {
  const { project_id } = req.body;

  try {
    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select()
      .eq('id', project_id)
      .eq('user_id', req.user.id)
      .single();

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Build prompt from project details
    const prompt = `${project.title}. ${project.description}. Characters: ${project.characters.join(', ')}. Channel type: ${project.channel_type}. Make this a professional, engaging video.`;

    // Call Replicate API for video generation (async)
    const videoOutput = await replicate.run(
      'black-forest-labs/flux-pro',
      {
        input: {
          prompt: prompt,
          num_frames: 60,
          fps: 24
        }
      }
    );

    // Generate music if enabled
    let musicOutput = null;
    if (project.music_enabled) {
      musicOutput = await replicate.run(
        'meta/musicgen',
        {
          input: {
            prompt: `Background music for: ${project.title}. Genre: uplifting, suitable for family-friendly video. Duration: 30 seconds.`,
            duration: 30
          }
        }
      );
    }

    // Store generation job
    const { data: job } = await supabase
      .from('video_jobs')
      .insert([{
        project_id,
        user_id: req.user.id,
        seedance_job_id: `replicate-${Date.now()}`,
        status: 'completed',
        video_url: videoOutput,
        music_url: musicOutput,
        created_at: new Date()
      }])
      .select();

    res.json({
      job_id: job[0].id,
      status: 'completed',
      video_url: videoOutput,
      music_url: musicOutput
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe Payment Intent
app.post('/api/create-payment-intent', verifyAuth, async (req, res) => {
  const { amount, project_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { project_id, user_id: req.user.id }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// YouTube OAuth Callback
app.post('/api/youtube/authorize', verifyAuth, async (req, res) => {
  const { code } = req.body;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    // Store refresh token in Supabase
    await supabase
      .from('users')
      .update({ youtube_refresh_token: tokenResponse.data.refresh_token })
      .eq('id', req.user.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Dream2Motion backend running on port ${PORT}`);
});
