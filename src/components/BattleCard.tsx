import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminDeleteButton from "./AdminDeleteButton";
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
interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
}
interface Comment {
  id: string;
  battle_id: string;
  parent_id: string | null;
}
const BattleCard = ({
  battle,
  knights,
  stigmas,
  profiles,
  onDelete
}: BattleCardProps) => {
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, [battle.id]);
  const fetchReactions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('battle_reactions').select('*').eq('battle_id', battle.id);
      if (error) throw error;
      setReactions(data || []);
      if (user) {
        const userReactionData = data?.find(r => r.user_id === user.id);
        setUserReaction(userReactionData?.reaction_type || null);
      }
    } catch (error) {
      console.error('Erro ao carregar reações:', error);
    }
  };
  const fetchComments = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('battle_comments').select('id, battle_id, parent_id').eq('battle_id', battle.id);
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };
  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user || loading) return;
    setLoading(true);
    try {
      // Remove existing reaction if any
      if (userReaction) {
        await supabase.from('battle_reactions').delete().eq('battle_id', battle.id).eq('user_id', user.id);
      }

      // If clicking the same reaction, just remove it
      if (userReaction === type) {
        setUserReaction(null);
      } else {
        // Add new reaction
        const {
          error
        } = await supabase.from('battle_reactions').insert({
          battle_id: battle.id,
          user_id: user.id,
          reaction_type: type
        });
        if (error) throw error;
        setUserReaction(type);
      }
      fetchReactions();
    } catch (error) {
      console.error('Erro ao salvar reação:', error);
    } finally {
      setLoading(false);
    }
  };
  const likeCount = reactions.filter(r => r.reaction_type === 'like').length;
  const dislikeCount = reactions.filter(r => r.reaction_type === 'dislike').length;
  const mainComments = comments.filter(c => !c.parent_id);
  const deleteBattle = async () => {
    const {
      error
    } = await supabase.from('battles').delete().eq('id', battle.id);
    if (error) throw error;
    if (onDelete) onDelete();
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
  return <Card className="bg-card hover:bg-card/70 transition-all duration-300 relative border-none cursor-pointer group">
      {battle.meta && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
          <span className="text-black text-lg">⭐</span>
        </div>}
      
      <div className="absolute top-2 left-2 z-20">
        <AdminDeleteButton onDelete={deleteBattle} itemType="batalha" className="w-6 h-6 p-0" />
      </div>

      <CardContent onClick={() => {
      const battleUrl = createBattleUrl(battle.winner_team, battle.loser_team, knights);
      window.location.href = `/battles/${battleUrl}`;
    }} className="p-3 pb-10 lg:p-6 lg:pb-6 max-w-full ">
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
        
        {/* Informação do autor e botões de like/dislike */}
        <div className="flex justify-between items-center bottom-2 lg:-bottom-2 absolute left-4 right-4">
          <div className="text-xs text-muted-foreground bg-card px-2 py-1 rounded">
            por {getProfileByUserId(battle.created_by)?.full_name || 'Desconhecido'}
          </div>
          
          <div className="flex gap-2 bg-card rounded px-1">
            <Button size="sm" variant="ghost" onClick={e => {
            e.stopPropagation();
            handleReaction('like');
          }} disabled={loading} className={`p-1 h-auto ${userReaction === 'like' ? 'text-green-500' : 'text-muted-foreground'}`}>
              <ThumbsUp className="w-4 h-4" />
              <span className="ml-1 text-xs">{likeCount}</span>
            </Button>
            
            <Button size="sm" variant="ghost" onClick={e => {
            e.stopPropagation();
            handleReaction('dislike');
          }} disabled={loading} className={`p-1 h-auto ${userReaction === 'dislike' ? 'text-red-500' : 'text-muted-foreground'}`}>
              <ThumbsDown className="w-4 h-4" />
              <span className="ml-1 text-xs">{dislikeCount}</span>
            </Button>
            
            <div className="border-l border-border h-6 mx-1"></div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{mainComments.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default BattleCard;