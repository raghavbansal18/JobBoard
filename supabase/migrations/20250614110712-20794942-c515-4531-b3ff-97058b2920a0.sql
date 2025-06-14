-- Enable Row Level Security on applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on applications table
-- This allows both public job applications and admin management
CREATE POLICY "Allow all operations on applications" 
ON public.applications 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policy to allow reading applications (for the admin interface)
CREATE POLICY "Allow reading applications" 
ON public.applications 
FOR SELECT 
USING (true);