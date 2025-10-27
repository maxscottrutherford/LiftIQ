# Supabase Setup Guide for LiftIQ

## Getting Your Supabase Credentials

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in to your account

2. **Create a New Project**
   - Click "New Project" in your dashboard
   - Fill in your project details:
     - Name: `LiftIQ` (or any name you prefer)
     - Database Password: Choose a strong password
     - Region: Choose the closest region to you
   - Click "Create new project"
   - Wait for the project to be provisioned (this takes a few minutes)

3. **Get Your API Credentials**
   - Once your project is ready, go to **Project Settings** (gear icon in the sidebar)
   - Click on **API** in the settings menu
   - You'll find two important values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (a long JWT token)

4. **Add Credentials to Your Project**
   - Copy the `.env.local.example` file to `.env.local`
   - Add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

## Authentication Configuration

### Email Authentication Setup

By default, Supabase has email authentication enabled. To configure it:

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Ensure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize the signup confirmation email if desired

### Email Confirmation (Optional)

You can choose whether to require email confirmation:

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Under **Auth Settings**, you'll find "Enable email confirmations"
3. Toggle this based on your preference

**Note**: For development, you might want to disable email confirmation. For production, it's recommended to keep it enabled.

## Database Schema (Future)

If you plan to store workout data in Supabase instead of localStorage:

1. Go to **Table Editor** in your Supabase dashboard
2. Create tables for:
   - `workout_splits`
   - `workout_sessions`
   - `exercises`
   - etc.

Example SQL:
```sql
-- Create workout_splits table
CREATE TABLE workout_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE workout_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own splits"
  ON workout_splits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own splits"
  ON workout_splits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own splits"
  ON workout_splits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own splits"
  ON workout_splits FOR DELETE
  USING (auth.uid() = user_id);
```

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Try signing up:
   - Click "Get Started" or navigate to `/signup`
   - Enter your email and password
   - Check your email for confirmation (if enabled)

4. Sign in:
   - Navigate to `/signin`
   - Use your credentials to sign in
   - You should be redirected to `/dashboard`

## Current Implementation

- ✅ User authentication (email/password)
- ✅ Sign up with email confirmation
- ✅ Sign in functionality
- ✅ Protected routes (middleware)
- ✅ Auth context for client components
- ✅ Session management
- ✅ Automatic redirect after sign in

## Next Steps

1. Add user profile data (name, avatar, etc.)
2. Migrate workout data from localStorage to Supabase
3. Add social authentication (Google, GitHub, etc.)
4. Implement password reset flow
5. Add user settings page

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes
- Restart your development server after changing environment variables

### "User already registered" error
- Try signing in instead of signing up
- Check your Supabase dashboard under **Authentication** > **Users**

### Email confirmation not working
- Check your Supabase email settings
- Verify the email in the Supabase dashboard
- For development, you can disable email confirmation in settings

### Redirect issues
- Clear your browser cookies
- Check that middleware is properly configured
- Verify the `dashboard` route exists

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Auth Example](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

