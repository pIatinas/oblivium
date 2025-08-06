-- Add tipo column to battles table with default
ALTER TABLE public.battles ADD COLUMN tipo text DEFAULT 'Padrão';