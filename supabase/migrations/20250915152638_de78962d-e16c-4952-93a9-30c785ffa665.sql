-- Update all knights with proper slugs using the existing function
UPDATE public.knights 
SET slug = public.generate_unique_knight_slug(name, id) 
WHERE slug IS NULL OR slug = '';