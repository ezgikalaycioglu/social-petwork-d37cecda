-- Optimize RLS policies by wrapping auth.uid() in subqueries for better performance

-- Update pet_profiles policies
DROP POLICY IF EXISTS "Users can view their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can create their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can update their own pet profiles" ON public.pet_profiles;
DROP POLICY IF EXISTS "Users can delete their own pet profiles" ON public.pet_profiles;

CREATE POLICY "Users can view their own pet profiles" 
  ON public.pet_profiles 
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own pet profiles" 
  ON public.pet_profiles 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own pet profiles" 
  ON public.pet_profiles 
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own pet profiles" 
  ON public.pet_profiles 
  FOR DELETE 
  USING (user_id = (SELECT auth.uid()));

-- Update profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = (SELECT auth.uid()));

-- Update user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (id = (SELECT auth.uid()));

-- Update notification_preferences policies
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can view their own notification preferences" 
  ON public.notification_preferences 
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notification preferences" 
  ON public.notification_preferences 
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own notification preferences" 
  ON public.notification_preferences 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Update business_profiles policies
DROP POLICY IF EXISTS "Users can update their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can create their own business profile" ON public.business_profiles;

CREATE POLICY "Users can update their own business profile" 
  ON public.business_profiles 
  FOR UPDATE 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own business profile" 
  ON public.business_profiles 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Update events policies
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their events" ON public.events;
DROP POLICY IF EXISTS "Users can update their events" ON public.events;
DROP POLICY IF EXISTS "Users can view their events" ON public.events;

CREATE POLICY "Users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (creator_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their events" 
  ON public.events 
  FOR DELETE 
  USING (creator_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their events" 
  ON public.events 
  FOR UPDATE 
  USING (creator_id = (SELECT auth.uid()) OR (SELECT auth.uid()) = ANY (participants));

CREATE POLICY "Users can view their events" 
  ON public.events 
  FOR SELECT 
  USING (creator_id = (SELECT auth.uid()) OR (SELECT auth.uid()) = ANY (participants));

-- Update adventures policies
DROP POLICY IF EXISTS "Users can create adventures for their pets" ON public.adventures;
DROP POLICY IF EXISTS "Users can delete their adventures" ON public.adventures;
DROP POLICY IF EXISTS "Users can update their adventures" ON public.adventures;
DROP POLICY IF EXISTS "Users can view relevant adventures" ON public.adventures;

CREATE POLICY "Users can create adventures for their pets" 
  ON public.adventures 
  FOR INSERT 
  WITH CHECK (owner_id = (SELECT auth.uid()) AND (EXISTS ( SELECT 1
   FROM pet_profiles
  WHERE ((pet_profiles.id = adventures.pet_id) AND (pet_profiles.user_id = (SELECT auth.uid()))))));

CREATE POLICY "Users can delete their adventures" 
  ON public.adventures 
  FOR DELETE 
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their adventures" 
  ON public.adventures 
  FOR UPDATE 
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Users can view relevant adventures" 
  ON public.adventures 
  FOR SELECT 
  USING (owner_id = (SELECT auth.uid()) OR (EXISTS ( SELECT 1
   FROM pet_profiles
  WHERE ((pet_profiles.id = ANY (adventures.tagged_pet_ids)) AND (pet_profiles.user_id = (SELECT auth.uid()))))));

-- Update packs policies
DROP POLICY IF EXISTS "Pack creators can delete their packs" ON public.packs;
DROP POLICY IF EXISTS "Pack creators can update their packs" ON public.packs;
DROP POLICY IF EXISTS "Users can create packs" ON public.packs;

CREATE POLICY "Pack creators can delete their packs" 
  ON public.packs 
  FOR DELETE 
  USING (created_by = (SELECT auth.uid()));

CREATE POLICY "Pack creators can update their packs" 
  ON public.packs 
  FOR UPDATE 
  USING (created_by = (SELECT auth.uid()));

CREATE POLICY "Users can create packs" 
  ON public.packs 
  FOR INSERT 
  WITH CHECK (created_by = (SELECT auth.uid()));

-- Update pack_members policies
DROP POLICY IF EXISTS "Pack creators can manage memberships" ON public.pack_members;
DROP POLICY IF EXISTS "Users can join packs" ON public.pack_members;
DROP POLICY IF EXISTS "Users can leave packs" ON public.pack_members;

CREATE POLICY "Pack creators can manage memberships" 
  ON public.pack_members 
  FOR ALL 
  USING (EXISTS ( SELECT 1
   FROM packs
  WHERE ((packs.id = pack_members.pack_id) AND (packs.created_by = (SELECT auth.uid())))));

CREATE POLICY "Users can join packs" 
  ON public.pack_members 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can leave packs" 
  ON public.pack_members 
  FOR DELETE 
  USING (user_id = (SELECT auth.uid()));

-- Update deal_redemptions policies
DROP POLICY IF EXISTS "Users can create their own redemptions" ON public.deal_redemptions;
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.deal_redemptions;
DROP POLICY IF EXISTS "Business owners can view redemptions for their deals" ON public.deal_redemptions;

CREATE POLICY "Users can create their own redemptions" 
  ON public.deal_redemptions 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own redemptions" 
  ON public.deal_redemptions 
  FOR SELECT 
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Business owners can view redemptions for their deals" 
  ON public.deal_redemptions 
  FOR SELECT 
  USING (EXISTS ( SELECT 1
   FROM (deals d
     JOIN business_profiles bp ON ((d.business_id = bp.id)))
  WHERE ((d.id = deal_redemptions.deal_id) AND (bp.user_id = (SELECT auth.uid())))));

-- Update FCM tokens and push subscriptions policies
DROP POLICY IF EXISTS "Users can manage their own FCM tokens" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage their own FCM tokens" 
  ON public.fcm_tokens 
  FOR ALL 
  USING (user_id = (SELECT auth.uid())) 
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage their own push subscriptions" 
  ON public.push_subscriptions 
  FOR ALL 
  USING (user_id = (SELECT auth.uid())) 
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Update pet_friendships policies
DROP POLICY IF EXISTS "Users can create friendship requests from their pets" ON public.pet_friendships;
DROP POLICY IF EXISTS "Users can delete friendships involving their pets" ON public.pet_friendships;
DROP POLICY IF EXISTS "Users can update friendship requests to their pets" ON public.pet_friendships;
DROP POLICY IF EXISTS "Users can view friendships involving their pets" ON public.pet_friendships;

CREATE POLICY "Users can create friendship requests from their pets" 
  ON public.pet_friendships 
  FOR INSERT 
  WITH CHECK (EXISTS ( SELECT 1
   FROM pet_profiles
  WHERE ((pet_profiles.id = pet_friendships.requester_pet_id) AND (pet_profiles.user_id = (SELECT auth.uid())))));

CREATE POLICY "Users can delete friendships involving their pets" 
  ON public.pet_friendships 
  FOR DELETE 
  USING (EXISTS ( SELECT 1
   FROM pet_profiles
  WHERE (((pet_profiles.id = pet_friendships.requester_pet_id) OR (pet_profiles.id = pet_friendships.recipient_pet_id)) AND (pet_profiles.user_id = (SELECT auth.uid())))));

CREATE POLICY "Users can update friendship requests to their pets" 
  ON public.pet_friendships 
  FOR UPDATE 
  USING (EXISTS ( SELECT 1
   FROM pet_profiles
  WHERE ((pet_profiles.id = pet_friendships.recipient_pet_id) AND (pet_profiles.user_id = (SELECT auth.uid())))));

CREATE POLICY "Users can view friendships involving their pets" 
  ON public.pet_friendships 
  FOR SELECT 
  USING (EXISTS ( SELECT 1
   FROM pet_profiles
  WHERE (((pet_profiles.id = pet_friendships.requester_pet_id) OR (pet_profiles.id = pet_friendships.recipient_pet_id)) AND (pet_profiles.user_id = (SELECT auth.uid())))));

-- Update deals policies
DROP POLICY IF EXISTS "Business owners can manage their deals" ON public.deals;

CREATE POLICY "Business owners can manage their deals" 
  ON public.deals 
  FOR ALL 
  USING (EXISTS ( SELECT 1
   FROM business_profiles
  WHERE ((business_profiles.id = deals.business_id) AND (business_profiles.user_id = (SELECT auth.uid())))));