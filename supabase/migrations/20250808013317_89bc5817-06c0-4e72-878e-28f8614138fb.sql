
-- Fix Profile Data Exposure - Replace permissive policy with restrictive ones
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create security definer function to check if user is active
CREATE OR REPLACE FUNCTION public.is_user_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(active, false) FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- Create security definer function to check if user is master
CREATE OR REPLACE FUNCTION public.is_user_master(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'master' FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- New restrictive profile policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Masters can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_user_master(auth.uid()));

-- Add DELETE policy for profiles (masters only)
CREATE POLICY "Masters can delete profiles"
ON public.profiles
FOR DELETE
USING (public.is_user_master(auth.uid()));

-- Enforce active status on all data access
-- Update battles policies to check active status
DROP POLICY IF EXISTS "Authenticated users can view all battles" ON public.battles;
DROP POLICY IF EXISTS "Authenticated users can create battles" ON public.battles;
DROP POLICY IF EXISTS "Authenticated users can update battles" ON public.battles;
DROP POLICY IF EXISTS "Authenticated users can delete battles" ON public.battles;

CREATE POLICY "Active users can view all battles"
ON public.battles
FOR SELECT
USING (public.is_user_active(auth.uid()));

CREATE POLICY "Active users can create battles"
ON public.battles
FOR INSERT
WITH CHECK (public.is_user_active(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Masters can update battles"
ON public.battles
FOR UPDATE
USING (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

CREATE POLICY "Masters can delete battles"
ON public.battles
FOR DELETE
USING (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

-- Update knights policies to check active status
DROP POLICY IF EXISTS "Authenticated users can view all knights" ON public.knights;
DROP POLICY IF EXISTS "Authenticated users can create knights" ON public.knights;
DROP POLICY IF EXISTS "Authenticated users can update knights" ON public.knights;
DROP POLICY IF EXISTS "Authenticated users can delete knights" ON public.knights;

CREATE POLICY "Active users can view all knights"
ON public.knights
FOR SELECT
USING (public.is_user_active(auth.uid()));

CREATE POLICY "Active users can create knights"
ON public.knights
FOR INSERT
WITH CHECK (public.is_user_active(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Masters can update knights"
ON public.knights
FOR UPDATE
USING (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

CREATE POLICY "Masters can delete knights"
ON public.knights
FOR DELETE
USING (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

-- Update stigmas policy to check active status
DROP POLICY IF EXISTS "Authenticated users can view all stigmas" ON public.stigmas;

CREATE POLICY "Active users can view all stigmas"
ON public.stigmas
FOR SELECT
USING (public.is_user_active(auth.uid()));

-- Add policies for stigma management (masters only)
CREATE POLICY "Masters can create stigmas"
ON public.stigmas
FOR INSERT
WITH CHECK (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

CREATE POLICY "Masters can update stigmas"
ON public.stigmas
FOR UPDATE
USING (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

CREATE POLICY "Masters can delete stigmas"
ON public.stigmas
FOR DELETE
USING (public.is_user_active(auth.uid()) AND public.is_user_master(auth.uid()));

-- Set wallace_erick@hotmail.com as master and active
UPDATE public.profiles 
SET role = 'master', active = true 
WHERE email = 'wallace_erick@hotmail.com';
