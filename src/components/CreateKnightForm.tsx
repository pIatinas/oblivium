import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface CreateKnightFormProps {
  onKnightCreated: () => void;
  onClose?: () => void;
}
const CreateKnightForm = ({
  onKnightCreated,
  onClose
}: CreateKnightFormProps) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      const {
        error
      } = await supabase.from('knights').insert({
        name,
        image_url: imageUrl,
        created_by: user.id
      });
      if (error) throw error;
      toast({
        title: "Cavaleiro criado!",
        description: `${name} foi adicionado com sucesso`
      });
      setName("");
      setImageUrl("");
      onKnightCreated();
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o cavaleiro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cavaleiro</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Seiya de Pégaso" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input id="imageUrl" type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." required />
      </div>

      <div className="flex gap-2 flex-row-reverse ">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Criando..." : "Criar Cavaleiro"}
        </Button>
        {onClose && <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>}
      </div>
    </form>;
};
export default CreateKnightForm;