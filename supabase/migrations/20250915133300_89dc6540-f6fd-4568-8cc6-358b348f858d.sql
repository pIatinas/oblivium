-- Add favorite_knight_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN favorite_knight_id uuid REFERENCES public.knights(id);