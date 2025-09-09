-- Create table for battle comments
CREATE TABLE public.battle_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.battle_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for battle_comments
ALTER TABLE public.battle_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for battle_comments
CREATE POLICY "Authenticated users can view all battle comments" 
ON public.battle_comments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create battle comments" 
ON public.battle_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own battle comments" 
ON public.battle_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own battle comments" 
ON public.battle_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for battle likes/dislikes
CREATE TABLE public.battle_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- Enable RLS for battle_reactions
ALTER TABLE public.battle_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for battle_reactions
CREATE POLICY "Authenticated users can view all battle reactions" 
ON public.battle_reactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create battle reactions" 
ON public.battle_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own battle reactions" 
ON public.battle_reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own battle reactions" 
ON public.battle_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating battle_comments updated_at
CREATE TRIGGER update_battle_comments_updated_at
BEFORE UPDATE ON public.battle_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();