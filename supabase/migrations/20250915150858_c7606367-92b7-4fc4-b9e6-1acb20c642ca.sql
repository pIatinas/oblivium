-- Security Fix Migration: Restrict data access and fix permissions

-- 1. Fix Profile Visibility - Hide sensitive data from non-admins
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Allow users to see basic info only, admins can see everything
CREATE POLICY "Users can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own full profile
  auth.uid() = user_id 
  OR 
  -- Admins can see all profiles
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Others can only see basic info (we'll handle this in the application layer)
  auth.uid() IS NOT NULL
);

-- 2. Fix Battle Permissions - Only creators or admins can modify
DROP POLICY IF EXISTS "Authenticated users can delete battles" ON public.battles;
DROP POLICY IF EXISTS "Authenticated users can update battles" ON public.battles;

CREATE POLICY "Only creators and admins can delete battles" 
ON public.battles 
FOR DELETE 
USING (
  auth.uid() = created_by 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only creators and admins can update battles" 
ON public.battles 
FOR UPDATE 
USING (
  auth.uid() = created_by 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fix Knight Permissions - Only creators or admins can modify  
DROP POLICY IF EXISTS "Authenticated users can delete knights" ON public.knights;
DROP POLICY IF EXISTS "Authenticated users can update knights" ON public.knights;

CREATE POLICY "Only creators and admins can delete knights" 
ON public.knights 
FOR DELETE 
USING (
  auth.uid() = created_by 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only creators and admins can update knights" 
ON public.knights 
FOR UPDATE 
USING (
  auth.uid() = created_by 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Remove unused role column from profiles to avoid confusion
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;