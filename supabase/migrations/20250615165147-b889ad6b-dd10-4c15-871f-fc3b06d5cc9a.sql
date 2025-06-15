
-- 1. Enum types for consistency and rich filtering
CREATE TYPE project_type AS ENUM ('keycloak', 'spring-boot', 'microservices', 'full-stack', 'web-app', 'api', 'mobile', 'desktop');
CREATE TYPE project_complexity AS ENUM ('Simple', 'Beginner', 'Intermediate', 'Advanced');
CREATE TYPE project_category AS ENUM ('web-app', 'api', 'full-stack', 'mobile', 'desktop');
CREATE TYPE tech_stack AS ENUM (
  'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Framer Motion', 'Chart.js', 'PWA', 
  'TinyMCE', 'React Query', 'DnD Kit', 'Next.js', 'Stripe', 'Socket.IO', 'Hugging Face', 'llama.cpp', 
  'GitHub API', 'Recharts', 'PapaParse', 'PDF', 'Swagger', 'Markdown', 'Docker', 
  'onnxruntime-web', 'Web Workers', 'Vercel', 'Other'
);
CREATE TYPE project_role AS ENUM (
  'developer', 'designer', 'product manager', 'security', 'devops', 'qa', 'ai practitioner',
  'researcher', 'customer', 'technical writer', 'ux designer', 'data analyst', 
  'customer success', 'manager', 'seo', 'job seeker', 'student', 'machine learning engineer'
);

-- 2. Project Template Table (for defining project blueprints)
CREATE TABLE public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  tech_stack tech_stack[],
  complexity project_complexity NOT NULL,
  category project_category NOT NULL,
  estimated_hours TEXT,
  learning_objectives TEXT[],
  roles project_role[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. User Projects Table (for individual user/project combinations)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.project_templates(id),
  tech_stack tech_stack[],
  complexity project_complexity,
  category project_category,
  estimated_hours TEXT,
  roles project_role[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Allow open read/write to everyone (public CRUD, no RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Allow all write projects" ON public.projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update projects" ON public.projects
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete projects" ON public.projects
  FOR DELETE USING (true);

CREATE POLICY "Allow all read templates" ON public.project_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow all write templates" ON public.project_templates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update templates" ON public.project_templates
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete templates" ON public.project_templates
  FOR DELETE USING (true);
