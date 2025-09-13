-- Create user_knights table to track which knights users have and their status
CREATE TABLE public.user_knights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  knight_id UUID NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, knight_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_knights ENABLE ROW LEVEL SECURITY;

-- Create policies for user knights
CREATE POLICY "Users can view their own knights" 
ON public.user_knights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user knights" 
ON public.user_knights 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own knights" 
ON public.user_knights 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user knights" 
ON public.user_knights 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_knights_updated_at
BEFORE UPDATE ON public.user_knights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();