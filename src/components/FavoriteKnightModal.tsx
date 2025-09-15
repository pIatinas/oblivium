import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
interface Knight {
  id: string;
  name: string;
  image_url: string;
}
interface FavoriteKnightModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentFavoriteId?: string;
  onUpdate: () => void;
}
const FavoriteKnightModal = ({
  isOpen,
  onClose,
  userId,
  currentFavoriteId,
  onUpdate
}: FavoriteKnightModalProps) => {
  const [knights, setKnights] = useState<Knight[]>([]);
  const [selectedKnight, setSelectedKnight] = useState<string | null>(currentFavoriteId || null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      fetchKnights();
      setSelectedKnight(currentFavoriteId || null);
    }
  }, [isOpen, currentFavoriteId]);
  const fetchKnights = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('knights').select('*').order('name');
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error('Error fetching knights:', error);
    }
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      const {
        error
      } = await supabase.from('profiles').update({
        favorite_knight_id: selectedKnight
      }).eq('user_id', userId);
      if (error) throw error;
      toast.success('Cavaleiro favorito atualizado!');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating favorite knight:', error);
      toast.error('Erro ao atualizar cavaleiro favorito');
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolher Cavaleiro Favorito</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {knights.map(knight => <div key={knight.id} className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedKnight === knight.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`} onClick={() => setSelectedKnight(knight.id)}>
              <Avatar className="w-16 h-16 mx-auto mb-2">
                <AvatarImage src={knight.image_url || '/placeholder.svg'} alt={knight.name} />
                <AvatarFallback>{knight.name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-center font-medium">{knight.name}</p>
            </div>)}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedKnight}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default FavoriteKnightModal;