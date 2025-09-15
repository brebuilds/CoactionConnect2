-- Supabase Database Setup for CoactionConnect
-- Run this in your Supabase SQL Editor

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  size TEXT NOT NULL,
  url TEXT NOT NULL,
  project_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  usage TEXT NOT NULL,
  pantone TEXT,
  project_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fonts table
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
  project_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'scheduled', 'published')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  approved_by TEXT,
  project_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_files table
CREATE TABLE IF NOT EXISTS knowledge_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  project_id TEXT NOT NULL,
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
CREATE POLICY "Allow all operations on assets" ON assets FOR ALL USING (true);
CREATE POLICY "Allow all operations on colors" ON colors FOR ALL USING (true);
CREATE POLICY "Allow all operations on fonts" ON fonts FOR ALL USING (true);
CREATE POLICY "Allow all operations on social_posts" ON social_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on knowledge_files" ON knowledge_files FOR ALL USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge', 'knowledge', true);

-- Create storage policies
CREATE POLICY "Allow all operations on assets bucket" ON storage.objects FOR ALL USING (bucket_id = 'assets');
CREATE POLICY "Allow all operations on knowledge bucket" ON storage.objects FOR ALL USING (bucket_id = 'knowledge');
