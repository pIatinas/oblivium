
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Knight {
  id: string;
  name: string;
  image_url: string;
}

interface Stigma {
  id: string;
  nome: string;
  imagem: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
  role: string;
}

interface Battle {
  id: string;
  winner_team: string[];
  loser_team: string[];
  winner_team_stigma: string | null;
  loser_team_stigma: string | null;
  created_at: string;
  created_by: string;
  meta: boolean | null;
  tipo: string;
}

interface BattleCardProps {
  battle: Battle;
  knights: Knight[];
  stigmas: Stigma[];
  profiles: Profile[];
  onDelete?: () => void;
  highlightKnightId?: string;
}

const BattleCard = ({ battle, knights, stigmas, profiles, onDelete, highlightKnightId }: BattleCardProps) => {
  const { toast } = useToast();

  const getKnightById = (knightId: string) => {
    return knights.find(knight => knight.id === knightId);
  };

  const getStigmaById = (stigmaId: string) => {
    return stigmas.find(stigma => stigma.id === stigmaId);
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(profile => profile.user_id === userId);
  };

  const getCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const profile = profiles.find(p => p.user_id === user.id);
    return profile?.role;
  };

  const handleDelete = async () => {
    const userRole = await getCurrentUserRole();
    
    if (userRole !== 'master') {
      toast({
        title: "Acesso negado",
        description: "Apenas masters podem excluir batalhas",
        variant: "destructive"
      });
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir esta batalha?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('battles')
        .delete()
        .eq('id', battle.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Batalha excluída com sucesso"
      });

      onDelete?.();
    } catch (error: any) {
      console.error('Erro ao excluir batalha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a batalha",
        variant: "destructive"
      });
    }
  };

  const winnerStigma = battle.winner_team_stigma ? getStigmaById(battle.winner_team_stigma) : null;
  const loserStigma = battle.loser_team_stigma ? getStigmaById(battle.loser_team_stigma) : null;
  const creator = getProfileByUserId(battle.created_by);

  return (
    <Card className="bg-card border-none shadow-lg relative">
      {battle.meta && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
          <span className="text-black text-4xl">⭐</span>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {battle.tipo}
            </Badge>
            {battle.meta && (
              <Badge variant="secondary" className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                Meta
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Time Vencedor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-lg">🏆</div>
              <span className="text-accent font-semibold">Vencedor</span>
              {winnerStigma && (
                <img src={winnerStigma.imagem} alt={winnerStigma.nome} className="w-5 h-5" />
              )}
            </div>
            
            <div className="space-y-2">
              {battle.winner_team.map(knightId => {
                const knight = getKnightById(knightId);
                if (!knight) return null;
                const isHighlighted = highlightKnightId === knightId;
                
                return (
                  <div key={knightId} className={`flex items-center gap-2 p-2 rounded-lg ${isHighlighted ? 'bg-white/10 border border-white/30' : 'bg-accent/5 border border-accent/10'}`}>
                    <img 
                      src={knight.image_url} 
                      alt={knight.name} 
                      className="w-8 h-8 rounded-full border border-accent/20" 
                    />
                    <span className={`text-sm font-medium ${isHighlighted ? 'text-white' : 'text-foreground'}`}>
                      {knight.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Perdedor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-lg">💀</div>
              <span className="text-purple-400 font-semibold">Perdedor</span>
              {loserStigma && (
                <img src={loserStigma.imagem} alt={loserStigma.nome} className="w-5 h-5" />
              )}
            </div>
            
            <div className="space-y-2">
              {battle.loser_team.map(knightId => {
                const knight = getKnightById(knightId);
                if (!knight) return null;
                const isHighlighted = highlightKnightId === knightId;
                
                return (
                  <div key={knightId} className={`flex items-center gap-2 p-2 rounded-lg ${isHighlighted ? 'bg-white/10 border border-white/30' : 'bg-purple-400/5 border border-purple-400/10'}`}>
                    <img 
                      src={knight.image_url} 
                      alt={knight.name} 
                      className="w-8 h-8 rounded-full border border-purple-400/20" 
                    />
                    <span className={`text-sm font-medium ${isHighlighted ? 'text-white' : 'text-foreground'}`}>
                      {knight.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Por: {creator?.full_name || 'Usuário'}
            </span>
            <Link 
              to={`/battles/${battle.id}`}
              className="text-accent hover:text-accent/80 font-medium"
            >
              Ver detalhes
            </Link>
            <span>
              {new Date(battle.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleCard;
