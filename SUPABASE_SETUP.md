# Supabase Setup - Dream2Motion.ai

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left menu
3. Click **New Query**

## Step 2: Copy & Paste Schema

Open `dream2motion-database/schema.sql` and copy ALL the contents.

Paste into the Supabase SQL editor and click **Run**.

You should see success messages creating 4 tables:
- users
- projects
- video_jobs
- payments

## Step 3: Get Connection Details

After schema runs successfully:

1. Go to **Settings** (bottom left)
2. Click **Database**
3. Copy these values and save them:
   - **Project URL** - looks like `https://xxxxx.supabase.co`
   - **Anon Public Key** - long string starting with `eyJ...`

## Step 4: Update Backend .env

In `dream2motion-backend/.env`, add:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...
```

Paste your actual values from Step 3.

## Done

Your database is ready. Backend can now connect and store user data, projects, video jobs, and payments.
