-- Ensure uuid_generate_v4() is available in public schema for migrations.
-- Supabase installs uuid-ossp in extensions schema; provide a public wrapper.
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid AS $$
  SELECT gen_random_uuid();
$$ LANGUAGE sql;
