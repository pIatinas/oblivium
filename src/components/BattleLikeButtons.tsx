import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
interface BattleLikeButtonsProps {
  battleId: string;
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
const BattleLikeButtons = ({
  battleId
}: BattleLikeButtonsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    user
  } = useAuth();
  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, [battleId]);
  const fetchReactions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('battle_reactions').select('*').eq('battle_id', battleId);
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
      const { data, error } = await supabase
        .from('battle_comments')
        .select('id, battle_id, parent_id')
        .eq('battle_id', battleId);
      
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
        await supabase.from('battle_reactions').delete().eq('battle_id', battleId).eq('user_id', user.id);
      }

      // If clicking the same reaction, just remove it
      if (userReaction === type) {
        setUserReaction(null);
      } else {
        // Add new reaction
        const {
          error
        } = await supabase.from('battle_reactions').insert({
          battle_id: battleId,
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
  
  return <div className="flex gap-2 absolute -bottom-3 left-auto right-2 text-xs text-muted-foreground bg-card rounded px-1 justify-end ">
      <Button size="sm" variant="ghost" onClick={() => handleReaction('like')} disabled={loading} className={`p-1 h-auto ${userReaction === 'like' ? 'text-green-500' : 'text-muted-foreground'}`}>
        <ThumbsUp className="w-4 h-4" />
        <span className="ml-1 text-xs">{likeCount}</span>
      </Button>
      
      <Button size="sm" variant="ghost" onClick={() => handleReaction('dislike')} disabled={loading} className={`p-1 h-auto ${userReaction === 'dislike' ? 'text-red-500' : 'text-muted-foreground'}`}>
        <ThumbsDown className="w-4 h-4" />
        <span className="ml-1 text-xs">{dislikeCount}</span>
      </Button>
      
      <div className="border-l border-border h-6 mx-1"></div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageCircle className="w-4 h-4" />
        <span className="text-xs">{mainComments.length}</span>
      </div>
    </div>;
};
export default BattleLikeButtons;