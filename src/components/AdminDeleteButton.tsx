import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";

interface AdminDeleteButtonProps {
  onDelete: () => Promise<void>;
  itemType: "batalha" | "comentário";
  className?: string;
}

const AdminDeleteButton = ({ onDelete, itemType, className }: AdminDeleteButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();

  if (loading || !isAdmin) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      toast({
        title: "Sucesso",
        description: `${itemType} deletado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível deletar o ${itemType}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto ${className}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar este {itemType}? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminDeleteButton;