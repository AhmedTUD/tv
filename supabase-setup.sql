-- SQL Script to setup Supabase database for TV Compare Pro
-- Run this in Supabase SQL Editor

-- Create the app_data table
CREATE TABLE IF NOT EXISTS app_data (
  id INTEGER PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for public access)
-- WARNING: This allows anyone to read/write. For production, add authentication!
CREATE POLICY "Allow all access to app_data" 
ON app_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert initial empty row
INSERT INTO app_data (id, payload) 
VALUES (1, '{"fields": [], "models": [], "last_updated": ""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_app_data_updated_at ON app_data;
CREATE TRIGGER update_app_data_updated_at 
BEFORE UPDATE ON app_data 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
