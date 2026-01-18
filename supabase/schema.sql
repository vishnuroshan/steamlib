-- Create the game_metadata table for caching IGDB info
CREATE TABLE IF NOT EXISTS game_metadata (
    appid INT8 PRIMARY KEY, -- Steam AppID
    igdb_id INT8,           -- IGDB ID
    name TEXT NOT NULL,
    genres JSONB DEFAULT '[]'::jsonb,
    rating FLOAT4,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE game_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (Select)
CREATE POLICY "Allow public read access" ON game_metadata
    FOR SELECT USING (true);

-- Create policy to allow service role/anon to insert (or update based on your needs)
-- For a cache, we usually allow anon to insert if we trust the API, 
-- but better to restrict to service role for security if possible.
-- For now, allowing anon to insert for simplicity in this setup.
CREATE POLICY "Allow anon insert" ON game_metadata
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON game_metadata
    FOR UPDATE USING (true);

-- Create user_profiles table (Privacy friendly: Only identity, no games)
CREATE TABLE IF NOT EXISTS user_profiles (
    steam_id TEXT PRIMARY KEY,
    username TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow anon insert/update" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Add missing columns to game_metadata if they don't exist
ALTER TABLE game_metadata ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE game_metadata ADD COLUMN IF NOT EXISTS year INT; 
ALTER TABLE game_metadata ADD COLUMN IF NOT EXISTS external_game_source INT;
