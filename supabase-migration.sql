-- Migration script to add missing columns to existing tables
-- Run this if you get "column does not exist" errors

-- Add project_id column to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add project_id to assets table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'project_id') THEN
        ALTER TABLE assets ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default-project';
    END IF;
    
    -- Add project_id to colors table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'colors' AND column_name = 'project_id') THEN
        ALTER TABLE colors ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default-project';
    END IF;
    
    -- Add project_id to fonts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fonts' AND column_name = 'project_id') THEN
        ALTER TABLE fonts ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default-project';
    END IF;
    
    -- Add project_id to social_posts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'project_id') THEN
        ALTER TABLE social_posts ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default-project';
    END IF;
    
    -- Add project_id to knowledge_files table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_files' AND column_name = 'project_id') THEN
        ALTER TABLE knowledge_files ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default-project';
    END IF;
END $$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  size TEXT NOT NULL,
  url TEXT NOT NULL,
  project_id TEXT NOT NULL DEFAULT 'default-project',
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  usage TEXT NOT NULL,
  pantone TEXT,
  project_id TEXT NOT NULL DEFAULT 'default-project',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fonts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  weight TEXT NOT NULL,
  usage TEXT NOT NULL,
  family TEXT NOT NULL,
  url TEXT,
  file_name TEXT,
  file_size TEXT,
  uploaded_by TEXT,
  project_id TEXT NOT NULL DEFAULT 'default-project',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'scheduled', 'published')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  project_id TEXT NOT NULL DEFAULT 'default-project',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  project_id TEXT NOT NULL DEFAULT 'default-project',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_colors_project_id ON colors(project_id);
CREATE INDEX IF NOT EXISTS idx_fonts_project_id ON fonts(project_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_project_id ON social_posts(project_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_project_id ON knowledge_files(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can make them more restrictive later)
DROP POLICY IF EXISTS "Allow all operations on assets" ON assets;
CREATE POLICY "Allow all operations on assets" ON assets FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on colors" ON colors;
CREATE POLICY "Allow all operations on colors" ON colors FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on fonts" ON fonts;
CREATE POLICY "Allow all operations on fonts" ON fonts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on social_posts" ON social_posts;
CREATE POLICY "Allow all operations on social_posts" ON social_posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on knowledge_files" ON knowledge_files;
CREATE POLICY "Allow all operations on knowledge_files" ON knowledge_files FOR ALL USING (true);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge', 'knowledge', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Allow all operations on assets bucket" ON storage.objects;
CREATE POLICY "Allow all operations on assets bucket" ON storage.objects FOR ALL USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Allow all operations on knowledge bucket" ON storage.objects;
CREATE POLICY "Allow all operations on knowledge bucket" ON storage.objects FOR ALL USING (bucket_id = 'knowledge');
