-- Create the wellness_posts table
CREATE TABLE IF NOT EXISTS public.wellness_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT CHECK (category IN ('Mental Health', 'Fitness', 'Motivation')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.wellness_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to wellness_posts
CREATE POLICY "Allow public read access to wellness_posts" ON public.wellness_posts
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete wellness_posts (assuming admin role)
CREATE POLICY "Allow authenticated users to insert wellness_posts" ON public.wellness_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update wellness_posts" ON public.wellness_posts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete wellness_posts" ON public.wellness_posts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create the wellness_settings table
CREATE TABLE IF NOT EXISTS public.wellness_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one row
    affirmation_quote TEXT
);

-- Enable RLS
ALTER TABLE public.wellness_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to wellness_settings
CREATE POLICY "Allow public read access to wellness_settings" ON public.wellness_settings
    FOR SELECT USING (true);

-- Allow authenticated users to update wellness_settings
CREATE POLICY "Allow authenticated users to insert wellness_settings" ON public.wellness_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update wellness_settings" ON public.wellness_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert initial setting if it doesn't exist
INSERT INTO public.wellness_settings (id, affirmation_quote)
VALUES (1, 'Take a deep breath. You are capable of amazing things.')
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for wellness post thumbnail images (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('wellness-images', 'wellness-images', true) ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view wellness images
CREATE POLICY "Public Access to wellness images"
ON storage.objects FOR SELECT
USING (bucket_id = 'wellness-images');

-- Allow authenticated users (admins) to upload wellness images
CREATE POLICY "Authenticated users can upload wellness images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wellness-images');

-- Allow authenticated users (admins) to update wellness images
CREATE POLICY "Authenticated users can update wellness images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'wellness-images');

-- Allow authenticated users (admins) to delete wellness images
CREATE POLICY "Authenticated users can delete wellness images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'wellness-images');

