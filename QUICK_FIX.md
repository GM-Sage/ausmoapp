# Quick Supabase Setup Fix

## The Problem
You're getting this error:
```
ERROR [runtime not ready]: Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

## The Solution

### Step 1: Create `.env` file
Create a file named `.env` in your project root (same folder as `package.json`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://hviuzozqptsdshxzlpdf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aXV6b3pxcHRzZHNoeHpscGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4MDAsImV4cCI6MjA1MDU0ODgwMH0.your_actual_key_here
```

### Step 2: Get Your Actual Anon Key
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the "anon/public" key
5. Replace `your_actual_key_here` in the `.env` file

### Step 3: Test Connection
Run this command to test your connection:
```bash
node test-connection.js
```

### Step 4: Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create all tables

### Step 5: Restart App
```bash
npm start
```

## If Still Having Issues

1. **Check your Supabase project is active** - Make sure it's not paused
2. **Verify the URL format** - Should be `https://your-project-id.supabase.co`
3. **Check the anon key** - Should start with `eyJ` and be very long
4. **Make sure `.env` file is in the right location** - Same folder as `package.json`

## Common Mistakes
- ❌ Using the wrong URL format
- ❌ Using the service role key instead of anon key
- ❌ Not restarting the development server after creating `.env`
- ❌ Having typos in the environment variable names
