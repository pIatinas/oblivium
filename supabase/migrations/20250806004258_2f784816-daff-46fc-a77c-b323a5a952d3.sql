-- Add tipo column to battles table
ALTER TABLE public.battles ADD COLUMN tipo text DEFAULT 'Padrão';

-- Create enum for battle types (optional but good practice)
CREATE TYPE public.battle_type AS ENUM (
  'Cavaleiros de Hades',
  'Cavaleiros da Lua', 
  'Cavaleiros de Athena',
  'Cavaleiros de Poseidon',
  'Cavaleiros Econômicos',
  'Padrão'
);

-- Update the column to use the enum type
ALTER TABLE public.battles ALTER COLUMN tipo TYPE public.battle_type USING tipo::public.battle_type;