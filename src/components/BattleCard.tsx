import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import BattleLikeButtons from "./BattleLikeButtons";
import { createBattleUrl } from "@/lib/utils";
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
}
const BattleCard = ({
  battle,
  knights,
  stigmas,
  profiles,
  onDelete
}: BattleCardProps) => {
  const [isMaster, setIsMaster] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    checkMasterStatus();
  }, []);
  const checkMasterStatus = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data: profile
        } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
        setIsMaster(profile?.role === 'master');
      }
    } catch (error) {
      console.error('Erro ao verificar status de master:', error);
    }
  };
  const getKnightById = (knightId: string) => {
    return knights.find(k => k.id === knightId);
  };
  const getStigmaById = (stigmaId: string) => {
    return stigmas.find(s => s.id === stigmaId);
  };
  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };
  const deleteBattle = async () => {
    try {
      const {
        error
      } = await supabase.from('battles').delete().eq('id', battle.id);
      if (error) throw error;
      toast({
        title: "Batalha excluída",
        description: "A batalha foi excluída com sucesso"
      });
      if (onDelete) onDelete();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a batalha",
        variant: "destructive"
      });
    }
  };
  return <Card className="bg-card hover:bg-card/70 hover:scale-105  transition-all duration-300 relative border-none shadow-none cursor-pointer group">
      {battle.meta && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
          <span className="text-black text-lg">⭐</span>
        </div>}
      
      {isMaster && <div className="absolute top-2 left-2 z-20">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 w-6 h-6 p-0" onClick={e => e.stopPropagation()}>
                <X className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir essa batalha?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={deleteBattle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>}

      <CardContent onClick={() => {
      const battleUrl = createBattleUrl(battle.winner_team, battle.loser_team, knights);
      window.location.href = `/battles/${battleUrl}`;
    }} className="p-3 lg:p-6 max-w-full ">
        <div className="flex items-center justify-between gap-1 lg:gap-4 ">
          {/* Time Vencedor */}
          <div className="flex-1 space-y-3">
            <h3 className="text-accent font-semibold text-center flex flex-col items-center gap-2">
              Vencedor
              {battle.winner_team_stigma && <img src={getStigmaById(battle.winner_team_stigma)?.imagem} alt="Estigma do time vencedor" className="w-6 h-6 lg:w-12 lg:h-12 " />}
            </h3>
            <div className="flex gap-2 justify-center">
              {battle.winner_team.slice(0, 3).map((knightId, index) => {
              const knight = getKnightById(knightId);
              return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                e.stopPropagation();
                window.location.href = `/knights?knight=${knight.id}`;
              }}>
                    <img src={knight.image_url} alt={knight.name} className="w-8 h-8 lg:w-14 lg:h-14 rounded-full border border-accent/20 hover:border-accent/40" />
                    <span className="text-xs text-foreground hover:text-accent transition-colors">
                      {knight.name}
                    </span>
                  </div> : null;
            })}
            </div>
          </div>

          {/* X Separador */}
          <div className="text-2xl font-bold text-muted-foreground">
            ✕
          </div>

          {/* Time Perdedor */}
          <div className="flex-1 space-y-3">
            <h3 className="text-purple-400 font-semibold text-center flex flex-col items-center gap-2">
              Perdedor
              {battle.loser_team_stigma && <img src={getStigmaById(battle.loser_team_stigma)?.imagem} alt="Estigma do time perdedor" className="w-6 h-6 lg:w-12 lg:h-12" />}
            </h3>
            <div className="flex gap-2 justify-center">
              {battle.loser_team.slice(0, 3).map((knightId, index) => {
              const knight = getKnightById(knightId);
              return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                e.stopPropagation();
                window.location.href = `/knights?knight=${knight.id}`;
              }}>
                    <img src={knight.image_url} alt={knight.name} className="w-8 h-8 lg:w-14 lg:h-14 rounded-full border border-purple-400/20 hover:border-purple-400/40" />
                    <span className="text-xs text-purple-300 hover:text-purple-400 transition-colors">
                      {knight.name}
                    </span>
                  </div> : null;
            })}
            </div>
          </div>
        </div>
        
        {/* Informação do autor */}
        <div className="absolute -bottom-1 left-4 text-xs text-muted-foreground bg-card text-white ">
          Por: {getProfileByUserId(battle.created_by)?.full_name || 'Desconhecido'}
        </div>
        
        <div className="absolute bottom-2 right-2">
          <BattleLikeButtons battleId={battle.id} />
        </div>
      </CardContent>
    </Card>;
};
export default BattleCard;