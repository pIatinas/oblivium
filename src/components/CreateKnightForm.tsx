
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateKnightFormProps {
  onKnightCreated: () => void;
}

const CreateKnightForm = ({ onKnightCreated }: CreateKnightFormProps) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do cavaleiro é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('knights')
        .insert({
          name: name.trim(),
          image_url: imageUrl.trim() || null,
          created_by: user.data.user.id
        });

      if (error) throw error;

      toast({
        title: "Cavaleiro criado!",
        description: `${name} foi adicionado com sucesso`,
      });

      setName("");
      setImageUrl("");
      onKnightCreated();
    } catch (error: any) {
      console.error('Erro ao criar cavaleiro:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o cavaleiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Cavaleiro</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome no jogo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1"
          disabled={loading}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-cosmic text-white hover:opacity-90"
        disabled={loading}
      >
        {loading ? "Criando..." : "Criar Cavaleiro"}
      </Button>
    </form>
  );
};

export default CreateKnightForm;
