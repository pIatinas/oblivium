
-- Criar tabela de estigmas
CREATE TABLE public.stigmas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  imagem text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar RLS na tabela de estigmas
ALTER TABLE public.stigmas ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam os estigmas
CREATE POLICY "Authenticated users can view all stigmas" 
  ON public.stigmas 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Adicionar campos de estigma nas batalhas
ALTER TABLE public.battles 
ADD COLUMN winner_team_stigma uuid REFERENCES public.stigmas(id),
ADD COLUMN loser_team_stigma uuid REFERENCES public.stigmas(id);

-- Inserir os estigmas padrão
INSERT INTO public.stigmas (nome, imagem) VALUES 
('Controle do Destino', 'https://via.placeholder.com/40'),
('Punição da Ganância', 'https://via.placeholder.com/40'),
('Presente do Patrono', 'https://via.placeholder.com/40'),
('Roubo do Fogo Sagrado', 'https://via.placeholder.com/40'),
('Maldição da Caixa Mágica', 'https://via.placeholder.com/40'),
('Velocidade Relâmpago', 'https://via.placeholder.com/40'),
('Sabedoria da Deusa', 'https://via.placeholder.com/40'),
('Deslizamento de Terra', 'https://via.placeholder.com/40'),
('Espada da Vitória', 'https://via.placeholder.com/40'),
('Égide de Asclépio', 'https://via.placeholder.com/40');
