-- Function to create diary tables
CREATE OR REPLACE FUNCTION create_diary_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Create diary_entries table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID NOT NULL,
    photo_url TEXT,
    photo_base64 TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  );

  -- Check if the photo_base64 column exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'diary_entries' AND column_name = 'photo_base64'
  ) INTO column_exists;
  
  -- Add the column if it doesn't exist
  IF NOT column_exists THEN
    EXECUTE 'ALTER TABLE public.diary_entries ADD COLUMN photo_base64 TEXT';
  END IF;

  -- Create user_settings table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    daily_reminders BOOLEAN DEFAULT FALSE,
    reminder_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    alarm_sound BOOLEAN DEFAULT FALSE,
    entry_prompts BOOLEAN DEFAULT FALSE,
    on_this_day BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  );

  -- Create Row Level Security (RLS) policies for diary_entries
  DROP POLICY IF EXISTS "Users can only access their own diary entries" ON diary_entries;
  CREATE POLICY "Users can only access their own diary entries"
    ON diary_entries
    FOR ALL
    USING (auth.uid() = user_id);

  -- Create RLS policies for user_settings
  DROP POLICY IF EXISTS "Users can only access their own settings" ON user_settings;
  CREATE POLICY "Users can only access their own settings"
    ON user_settings
    FOR ALL
    USING (auth.uid() = user_id);

  -- Enable RLS on both tables
  ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
END;
$$; 