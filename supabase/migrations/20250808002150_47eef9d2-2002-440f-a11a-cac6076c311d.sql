
-- Update the profiles table to ensure users start with role 'user' and active 'false'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE public.profiles ALTER COLUMN active SET DEFAULT false;

-- Update the specific user to master role
UPDATE public.profiles 
SET role = 'master' 
WHERE email = 'wallace_erick@hotmail.com';

-- Add RLS policy for masters to delete battles
CREATE POLICY "Masters can delete battles" 
ON public.battles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'master'
  )
);
