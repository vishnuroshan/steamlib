-- Create the game_metadata table for caching IGDB info
CREATE TABLE IF NOT EXISTS game_metadata (
    appid INT8 PRIMARY KEY,         -- Steam AppID
    igdb_id INT8,                   -- IGDB ID
    name TEXT NOT NULL,
    genres TEXT[] DEFAULT '{}',     -- Array of genre names (Postgres Array)
    platforms TEXT[] DEFAULT '{}',  -- Array of platform names (Postgres Array)
    year INT,                       -- Release year
    external_game_source INT,       -- 1=Steam, etc.
    rating FLOAT4,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE game_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (Select)
-- IF NOT EXISTS check is complex in SQL, usually we drop/create or just ignore error. 
-- For a schema file we can leave simple CREATEs.
CREATE POLICY "Allow public read access" ON game_metadata
    FOR SELECT USING (true);

CREATE POLICY "Allow anon insert" ON game_metadata
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update" ON game_metadata
    FOR UPDATE USING (true);
