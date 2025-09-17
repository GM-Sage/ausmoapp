# Supabase Setup Guide for Ausmo AAC App

This guide will help you set up Supabase as the database backend for your Ausmo AAC app.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Install Dependencies

The Supabase dependency has already been added to your `package.json`. Run:

```bash
npm install
```

## Step 2: Set Up Your Supabase Project

### 2.1 Create a New Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ausmo-aac-app` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"

### 2.2 Get Your Project Credentials
1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

### 3.1 Create Environment File
1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key-here
   ```

### 3.2 Update app.json (Alternative Method)
If you prefer to set environment variables directly in `app.json`, update the values in the `env` section:

```json
{
  "expo": {
    "env": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://your-project-id.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...your-anon-key-here"
    }
  }
}
```

## Step 4: Set Up Database Schema

### 4.1 Run the SQL Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` and paste it into the editor
4. Click "Run" to execute the migration

This will create all the necessary tables, indexes, triggers, and Row Level Security policies.

### 4.2 Verify Tables Created
Go to **Table Editor** and verify these tables were created:
- `users`
- `communication_books`
- `communication_pages`
- `communication_buttons`
- `messages`
- `symbols`
- `usage_analytics`
- `hotspots`
- `express_sentences`

## Step 5: Set Up Storage Buckets (Optional)

If you plan to store user photos, audio files, or other assets:

1. Go to **Storage** in your Supabase dashboard
2. Create these buckets:
   - `user-photos` (for user profile pictures)
   - `symbol-images` (for custom symbol images)
   - `audio-messages` (for recorded audio messages)
   - `background-images` (for page background images)

3. Set appropriate policies for each bucket (public read, authenticated write, etc.)

## Step 6: Test the Connection

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. Open your app and try to create a user
3. Check the Supabase dashboard to see if the user was created in the `users` table

## Step 7: Configure Row Level Security (Optional)

The initial setup includes permissive policies that allow all operations. For production, you should:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Review and modify the RLS policies to match your security requirements
3. Consider implementing user-based access control

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Ensure your `.env` file is in the project root
   - Check that the environment variable names start with `EXPO_PUBLIC_`
   - Restart your Expo development server after changing environment variables

2. **Database connection errors**
   - Verify your Supabase URL and anon key are correct
   - Check that your Supabase project is active (not paused)
   - Ensure the database schema has been created

3. **Permission errors**
   - Check that Row Level Security policies allow the operations you're trying to perform
   - Verify your anon key has the correct permissions

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Discord](https://discord.supabase.com) for community support
- Review the [Expo Environment Variables Guide](https://docs.expo.dev/guides/environment-variables/)

## Next Steps

Once Supabase is set up and working:

1. **Test all functionality**: Create users, books, pages, and buttons
2. **Set up authentication**: Consider implementing Supabase Auth for user management
3. **Configure storage**: Set up file uploads for photos and audio
4. **Implement real-time features**: Use Supabase's real-time subscriptions for live updates
5. **Set up backups**: Configure automated backups in Supabase
6. **Monitor usage**: Use Supabase's dashboard to monitor database usage and performance

## Migration from SQLite

If you have existing data in SQLite:

1. Export your data using the existing `createBackup()` method
2. Set up Supabase as described above
3. Use the `restoreBackup()` method to import your data

The Supabase service maintains the same interface as the SQLite service, so no code changes are needed beyond the initial setup.
