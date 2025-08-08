
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateKnightFormProps {
  onKnightCreated: () => void;
  onClose?: () => void;
}

const CreateKnightForm = ({ onKnightCreated, onClose }: CreateKnightFormProps) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !imageUrl.trim()) {
      toast({
        title: "Erro",
        description: "Nome e URL da imagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('knights')
        .insert([
          {
            name: name.trim(),
            image_url: imageUrl.trim(),
            created_by: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Cavaleiro cadastrado com sucesso"
      });

      setName("");
      setImageUrl("");
      onKnightCreated();
      onClose?.();
      
    } catch (error: any) {
      console.error('Erro ao criar cavaleiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o cavaleiro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome no jogo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-card border-border"
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
          className="bg-card border-border"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-cosmic text-white hover:opacity-90 flex-1"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-card border-border"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default CreateKnightForm;
