-- Create Recipes Table
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack', 'smoothie'
    ingredients JSONB DEFAULT '[]'::jsonb NOT NULL,
    instructions JSONB DEFAULT '[]'::jsonb NOT NULL,
    prep_time TEXT,
    calories INTEGER,
    macros JSONB DEFAULT '{"protein": 0, "carbs": 0, "fat": 0}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Daily Meals Table (Locket / IG Instants style)
CREATE TABLE IF NOT EXISTS public.daily_meals (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    meal_type TEXT NOT NULL, -- 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    description TEXT,
    image_url TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    macros JSONB DEFAULT '{"protein": 0, "carbs": 0, "fat": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meals ENABLE ROW LEVEL SECURITY;

-- Enable public read
CREATE POLICY "Public can view recipes" 
    ON public.recipes FOR SELECT 
    USING (true);

CREATE POLICY "Public can view daily meals" 
    ON public.daily_meals FOR SELECT 
    USING (true);

-- Enable public/admin insert for the demo setup
CREATE POLICY "Anyone can insert recipes" 
    ON public.recipes FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Anyone can insert daily meals" 
    ON public.daily_meals FOR INSERT 
    WITH CHECK (true);

-- Insert bucket for nutrition images
INSERT INTO storage.buckets (id, name, public) VALUES ('nutrition-images', 'nutrition-images', true) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of nutrition images
CREATE POLICY "Public Access to nutrition images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'nutrition-images');

-- Policy to allow uploading nutrition images
CREATE POLICY "Anyone can upload nutrition images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'nutrition-images');

-- Policy to allow authenticated users to update nutrition images
CREATE POLICY "Authenticated users can update nutrition images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'nutrition-images');

-- Policy to allow authenticated users to delete nutrition images
CREATE POLICY "Authenticated users can delete nutrition images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'nutrition-images');
