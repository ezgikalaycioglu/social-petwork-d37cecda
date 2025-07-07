
-- Create the packs table
CREATE TABLE public.packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the pack_members table
CREATE TABLE public.pack_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(pack_id, user_id)
);

-- Add RLS policies for packs table
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Users can view all packs
CREATE POLICY "Users can view all packs"
ON public.packs
FOR SELECT
USING (true);

-- Users can create packs
CREATE POLICY "Users can create packs"
ON public.packs
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Pack creators can update their packs
CREATE POLICY "Pack creators can update their packs"
ON public.packs
FOR UPDATE
USING (auth.uid() = created_by);

-- Pack creators can delete their packs
CREATE POLICY "Pack creators can delete their packs"
ON public.packs
FOR DELETE
USING (auth.uid() = created_by);

-- Add RLS policies for pack_members table
ALTER TABLE public.pack_members ENABLE ROW LEVEL SECURITY;

-- Users can view pack members
CREATE POLICY "Users can view pack members"
ON public.pack_members
FOR SELECT
USING (true);

-- Users can join packs (insert their own membership)
CREATE POLICY "Users can join packs"
ON public.pack_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can leave packs (delete their own membership)
CREATE POLICY "Users can leave packs"
ON public.pack_members
FOR DELETE
USING (auth.uid() = user_id);

-- Pack creators can manage memberships in their packs
CREATE POLICY "Pack creators can manage memberships"
ON public.pack_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.packs 
    WHERE packs.id = pack_members.pack_id 
    AND packs.created_by = auth.uid()
  )
);
