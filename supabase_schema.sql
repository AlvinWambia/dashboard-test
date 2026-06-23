-- Create Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    paystack_plan_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- In case the table already exists, add the new columns
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS paystack_plan_code TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create Form Steps Table
CREATE TABLE IF NOT EXISTS public.form_steps (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    program_id TEXT REFERENCES public.programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Form Questions Table
CREATE TABLE IF NOT EXISTS public.form_questions (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    step_id TEXT REFERENCES public.form_steps(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- e.g., 'text', 'multiple_choice', 'checkbox', 'date'
    is_required BOOLEAN DEFAULT false,
    options JSONB, -- Array of strings for multiple choice
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    client_id TEXT NOT NULL, -- References the client/user ID
    paystack_subscription_code TEXT UNIQUE,
    plan_code TEXT,
    status TEXT NOT NULL, -- 'active', 'non-renewing', 'attention', 'cancelled'
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Payment History Table
CREATE TABLE IF NOT EXISTS public.payment_history (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    client_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    reference TEXT UNIQUE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Policies for Programs
-- Public can read active programs
CREATE POLICY "Public can view active programs" 
    ON public.programs FOR SELECT 
    USING (is_active = true);

-- Policies for Form Steps and Questions
-- Public can read steps and questions for active programs
CREATE POLICY "Public can view form steps" 
    ON public.form_steps FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.programs WHERE id = form_steps.program_id AND is_active = true));

CREATE POLICY "Public can view form questions" 
    ON public.form_questions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.form_steps fs JOIN public.programs p ON fs.program_id = p.id WHERE fs.id = form_questions.step_id AND p.is_active = true));

-- Note: Admins interact with these tables via the Next.js API using the Service Role Key, 
-- which bypasses RLS automatically. So we don't strictly need admin-specific RLS policies for inserts/updates here.

-- Insert a storage bucket for program images
INSERT INTO storage.buckets (id, name, public) VALUES ('program-images', 'program-images', true) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of program images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'program-images');

-- Note: Admin uploads will be handled via the service role key which bypasses RLS.

-- Create Form Responses Table (Stores user answers)
CREATE TABLE IF NOT EXISTS public.form_responses (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    client_id TEXT NOT NULL,
    program_id TEXT REFERENCES public.programs(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- Note: Clients will insert their responses via a secure API route or with authenticated RLS policies later.

-- Add deliverables features to programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_digital_downloads BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_dashboard_access BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_online_consultations BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS has_physical_sessions BOOLEAN DEFAULT false;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS booking_url TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS location_details TEXT;

-- Create Program Assets Table for Digital Downloads
CREATE TABLE IF NOT EXISTS public.program_assets (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    program_id TEXT REFERENCES public.programs(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.program_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view program assets for active programs" 
    ON public.program_assets FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.programs WHERE id = program_assets.program_id AND is_active = true));

-- Create Client Programs Table to manage access
CREATE TABLE IF NOT EXISTS public.client_programs (
    id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
    client_id TEXT NOT NULL,
    program_id TEXT REFERENCES public.programs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    review_status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'not_required'
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.client_programs ENABLE ROW LEVEL SECURITY;

-- Note: client_programs policies will depend on how client auth is handled, 
-- but generally clients can read their own access records.

-- Insert a storage bucket for program documents/digital downloads
INSERT INTO storage.buckets (id, name, public) VALUES ('program-documents', 'program-documents', true) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public viewing of program documents (if they have the link)
CREATE POLICY "Public Document Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'program-documents');

-- Add review_status if table already exists
ALTER TABLE public.client_programs ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'approved';

