-- Add foreign key constraints to user_knights table
ALTER TABLE public.user_knights 
ADD CONSTRAINT fk_user_knights_knight_id 
FOREIGN KEY (knight_id) REFERENCES public.knights(id) ON DELETE CASCADE;