-- Move http extension from public schema to extensions schema
-- This follows Supabase best practices for extension management

-- First, drop the extension from the public schema
DROP EXTENSION IF EXISTS "http";

-- Then, create it in the extensions schema
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;