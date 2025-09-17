# Supabase Setup Instructions

## Step 1: Create Environment File

Create a `.env` file in your project root (same level as package.json) with the following content:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 2: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up Database Schema

Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create all tables

## Step 5: Test Your Setup

After setting up the environment variables, restart your development server:

```bash
npm start
```

The app should now connect to Supabase successfully!

## Troubleshooting

If you're still getting errors:

1. Make sure your `.env` file is in the project root
2. Restart your development server after creating the `.env` file
3. Check that your Supabase project is active and not paused
4. Verify your credentials are correct (no extra spaces or quotes)
