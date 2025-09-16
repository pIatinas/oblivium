import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateKnightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKnightCreated: () => void;
}

const CreateKnightModal = ({ isOpen, onClose, onKnightCreated }: CreateKnightModalProps) => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("Usuário não autenticado");
      }

      const slug = generateSlug(name);

      const { error } = await supabase
        .from('knights')
        .insert([
          {
            name: name.trim(),
            image_url: imageUrl.trim() || null,
            slug: slug,
            created_by: user.data.user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Cavaleiro Criado!",
        description: "O cavaleiro foi cadastrado com sucesso",
      });

      setName("");
      setImageUrl("");
      onKnightCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o cavaleiro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Novo Cavaleiro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              
              className="bg-background border-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-foreground">URL da Imagem</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              
              className="bg-background border-border"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-cosmic text-white hover:opacity-90"
            >
              {loading ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateKnightModal;