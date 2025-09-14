import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { createBattleUrl, createKnightUrl } from "@/lib/utils";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageCircle, Send, Reply } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
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
interface Battle {
  id: string;
  winner_team: string[];
  loser_team: string[];
  winner_team_stigma: string | null;
  loser_team_stigma: string | null;
  meta: boolean | null;
  tipo: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  winner_team_id?: string | null;
  loser_team_id?: string | null;
}
interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
}
interface BattleComment {
  id: string;
  battle_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}
interface BattleReaction {
  id: string;
  battle_id: string;
  user_id: string;
  reaction_type: 'like' | 'dislike';
  created_at: string;
}
const BattleDetail = () => {
  const {
    id,
    battleUrl
  } = useParams<{
    id?: string;
    battleUrl?: string;
  }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relatedBattles, setRelatedBattles] = useState<Battle[]>([]);
  const [comments, setComments] = useState<BattleComment[]>([]);
  const [reactions, setReactions] = useState<BattleReaction[]>([]);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const deleteBattle = async () => {
    if (!battle) return;
    const {
      error
    } = await supabase.from('battles').delete().eq('id', battle.id);
    if (error) throw error;
    window.location.href = '/battles';
  };
  const deleteComment = async (commentId: string) => {
    const {
      error
    } = await supabase.from('battle_comments').delete().eq('id', commentId);
    if (error) throw error;
    if (battle?.id) {
      fetchComments(battle.id);
    }
  };
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchKnights(), fetchStigmas(), fetchProfiles()]);
      if (id) {
        await fetchBattleDetail(id);
      } else if (battleUrl) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (isUuid.test(battleUrl)) {
          await fetchBattleDetail(battleUrl);
        } else {
          await fetchBattleByUrl(battleUrl);
        }
      }
      setLoading(false);
    };
    if (id || battleUrl) {
      init();
    } else {
      setLoading(false);
    }
  }, [id, battleUrl]);
  useEffect(() => {
    if (battle?.id) {
      fetchComments(battle.id);
      fetchReactions(battle.id);
    }
  }, [battle?.id]);
  useEffect(() => {
    if (battle && knights.length > 0) {
      fetchRelatedBattles();
    }
  }, [battle, knights]);
  const fetchBattleDetail = async (battleId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('battles').select('*').eq('id', battleId).single();
      if (error) throw error;
      setBattle({
        ...data,
        meta: (data as any).meta || false
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da batalha",
        variant: "destructive"
      });
    }
  };
  const fetchBattleByUrl = async (urlParam: string): Promise<Battle | null> => {
    try {
      // Garante que temos os cavaleiros carregados para montar a URL amigável
      let knightsSource = knights;
      if (!knightsSource || knightsSource.length === 0) {
        const {
          data: knightsData
        } = await supabase.from('knights').select('*');
        knightsSource = knightsData || [];
        if (knightsSource.length) setKnights(knightsSource);
      }
      const {
        data: battlesData,
        error
      } = await supabase.from('battles').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      const enriched = (battlesData || []).map((b: any) => ({
        ...b,
        meta: b.meta || false
      }));
      const found = enriched.find((b: any) => createBattleUrl(b.winner_team, b.loser_team, knightsSource) === urlParam) || null;
      setBattle(found || null);
      return found;
    } catch (error) {
      console.error('Erro ao carregar batalha pela URL amigável:', error);
      setBattle(null);
      return null;
    }
  };
  const fetchKnights = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('knights').select('*');
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cavaleiros:', error);
    }
  };
  const fetchStigmas = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('stigmas').select('*');
      if (error) throw error;
      setStigmas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estigmas:', error);
    }
  };
  const fetchProfiles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
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
  const fetchRelatedBattles = async () => {
    if (!battle) return;
    try {
      const {
        data,
        error
      } = await supabase.from('battles').select('*').neq('id', battle.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Filter battles that contain any knight from the winner team  
      const filtered = (data || []).filter((b: any) => {
        return battle.winner_team.some(knightId => [...b.winner_team, ...b.loser_team].includes(knightId));
      }).map((b: any) => ({
        ...b,
        meta: b.meta || false
      })).slice(0, 4);
      setRelatedBattles(filtered);
    } catch (error: any) {
      console.error('Erro ao carregar batalhas relacionadas:', error);
    }
  };
  const fetchComments = async (battleId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('battle_comments').select('*').eq('battle_id', battleId).order('created_at', {
        ascending: true
      });
      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar comentários:', error);
    }
  };
  const fetchReactions = async (battleId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('battle_reactions').select('*').eq('battle_id', battleId);
      if (error) throw error;
      setReactions((data || []) as BattleReaction[]);

      // Check user's reaction
      if (user) {
        const userReact = data?.find(r => r.user_id === user.id);
        setUserReaction(userReact?.reaction_type as 'like' | 'dislike' || null);
      }
    } catch (error: any) {
      console.error('Erro ao carregar reações:', error);
    }
  };
  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user || !battle?.id) return;
    try {
      if (userReaction === type) {
        // Remove reaction
        await supabase.from('battle_reactions').delete().eq('battle_id', battle.id).eq('user_id', user.id);
        setUserReaction(null);
      } else {
        // Add or update reaction
        await supabase.from('battle_reactions').upsert({
          battle_id: battle.id,
          user_id: user.id,
          reaction_type: type
        });
        setUserReaction(type);
      }
      fetchReactions(battle.id);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar sua reação",
        variant: "destructive"
      });
    }
  };
  const handleComment = async () => {
    if (!user || !newComment.trim() || !battle?.id) return;
    try {
      await supabase.from('battle_comments').insert({
        battle_id: battle.id,
        user_id: user.id,
        content: newComment.trim()
      });
      setNewComment("");
      fetchComments(battle.id);
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive"
      });
    }
  };
  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim() || !battle?.id) return;
    try {
      await supabase.from('battle_comments').insert({
        battle_id: battle.id,
        user_id: user.id,
        content: replyContent.trim(),
        parent_id: parentId
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchComments(battle.id);
      toast({
        title: "Sucesso",
        description: "Resposta adicionada com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a resposta",
        variant: "destructive"
      });
    }
  };
  const getLikeCount = () => reactions.filter(r => r.reaction_type === 'like').length;
  const getDislikeCount = () => reactions.filter(r => r.reaction_type === 'dislike').length;
  const getCommentReplies = (commentId: string) => {
    return comments.filter(c => c.parent_id === commentId);
  };
  const getMainComments = () => {
    return comments.filter(c => !c.parent_id);
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando detalhes da batalha...</div>
        </div>
      </div>;
  }
  if (!battle) {
    return <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-muted-foreground text-xl">Batalha não encontrada</div>
          <Button asChild className="mt-4">
            <Link to="/battles">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às Batalhas
            </Link>
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl mx-auto p-6">
        <Breadcrumb battleId={(id || battleUrl) as string} />
        
        <div className="mb-8">
          <h1 className="text-foreground mb-4 text-center text-2xl lg:text-4xl font-semibold">Detalhes da Batalha</h1>
        </div>

        <Card className="bg-card hover:bg-card/80 transition-all duration-300 relative border-none shadow-none">
          {battle.meta && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
              <span className="text-black text-xl">⭐</span>
            </div>}
          
          <div className="absolute top-2 left-2 z-20">
            <AdminDeleteButton onDelete={deleteBattle} itemType="batalha" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap flex-col lg:flex-row ">
              {/* Time Vencedor */}
              <div className="flex-1 space-y-3">
                <h3 className="text-accent font-semibold text-center flex flex-col items-center gap-2 text-2xl">
                  Vencedor
                  {battle.winner_team_stigma && <img src={getStigmaById(battle.winner_team_stigma)?.imagem} alt="Estigma do time vencedor" className="w-10 h-10" />}
                </h3>
                <div className="flex gap-2 justify-center">
                  {battle.winner_team.slice(0, 3).map((knightId, index) => {
                  const knight = getKnightById(knightId);
                  return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                    e.stopPropagation();
                    window.location.href = `/knight/${createKnightUrl(knight.id, knight.name)}`;
                  }}>
                        <img src={knight.image_url} alt={knight.name} className="w-12 h-12 rounded-full border border-accent/20 hover:border-accent/40" />
                        <span className="text-xs text-foreground hover:text-accent transition-colors">
                          {knight.name}
                        </span>
                      </div> : null;
                })}
                </div>
              </div>

              {/* X Separador */}
              <div className="text-3xl font-bold text-muted-foreground">
                ✕
              </div>

              {/* Time Perdedor */}
              <div className="flex-1 space-y-3">
                <h3 className="text-purple-400 font-semibold text-center flex flex-col items-center gap-2 text-2xl">
                  Perdedor
                  {battle.loser_team_stigma && <img src={getStigmaById(battle.loser_team_stigma)?.imagem} alt="Estigma do time perdedor" className="w-10 h-10" />}
                </h3>
                <div className="flex gap-2 justify-center">
                  {battle.loser_team.slice(0, 3).map((knightId, index) => {
                  const knight = getKnightById(knightId);
                  return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                    e.stopPropagation();
                    window.location.href = `/knight/${createKnightUrl(knight.id, knight.name)}`;
                  }}>
                        <img src={knight.image_url} alt={knight.name} className="w-12 h-12 rounded-full border border-purple-400/20 hover:border-purple-400/40" />
                        <span className="text-xs text-purple-300 hover:text-purple-400 transition-colors">
                          {knight.name}
                        </span>
                      </div> : null;
                })}
                </div>
              </div>
            </div>
            
            {/* Like/Dislike buttons */}
            <div className="absolute right-auto -bottom-[8px] left-[10px] flex items-center gap-2 bg-card rounded px-2 ">
              <Button variant="ghost" size="sm" onClick={() => handleReaction('like')} className={`p-1 h-auto hover:bg-card hover:text-white ${userReaction === 'like' ? 'text-green-500' : 'text-muted-foreground'}`}>
                <ThumbsUp className="w-4 h-4" />
                <span className="ml-1 text-xs">{getLikeCount()}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleReaction('dislike')} className={`p-1 h-auto hover:bg-card hover:text-white ${userReaction === 'dislike' ? 'text-red-500' : 'text-muted-foreground'}`}>
                <ThumbsDown className="w-4 h-4" />
                <span className="ml-1 text-xs">{getDislikeCount()}</span>
              </Button>
            </div>

            {/* Informação do autor */}
            <div className="absolute bottom-[-10px] right-[10px] bg-card px-2 py-1 rounded text-xs text-muted-foreground">
              por {getProfileByUserId(battle.created_by)?.full_name || 'Usuário'}
            </div>
          </CardContent>
        </Card>

        {/* Batalhas Relacionadas */}
        {relatedBattles.length > 0 && <div className="mt-8">
            <h3 className="text-2xl text-foreground mb-6 font-medium">
              Batalhas Relacionadas
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedBattles.map(relatedBattle => <Card key={relatedBattle.id} className="bg-card hover:bg-card/80 transition-all duration-300 relative border-none shadow-none cursor-pointer" onClick={() => window.location.href = `/battles/${relatedBattle.id}`}>
                  {relatedBattle.meta && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
                      <span className="text-black text-lg">⭐</span>
                    </div>}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Time Vencedor */}
                      <div className="flex-1 space-y-2">
                        <h4 className="text-accent font-semibold text-center text-sm flex flex-col items-center gap-1">
                          Vencedor
                          {relatedBattle.winner_team_stigma && <img src={getStigmaById(relatedBattle.winner_team_stigma)?.imagem} alt="Estigma do time vencedor" className="w-6 h-6" />}
                        </h4>
                        <div className="flex gap-1 justify-center">
                          {relatedBattle.winner_team.slice(0, 3).map((knightId, index) => {
                      const knight = getKnightById(knightId);
                      return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                        e.stopPropagation();
                        window.location.href = `/knights?knight=${knight.id}`;
                      }}>
                                <img src={knight.image_url} alt={knight.name} className="w-8 h-8 rounded-full border border-accent/20 hover:border-accent/40" />
                                <span className="text-xs text-foreground hover:text-accent transition-colors">
                                  {knight.name}
                                </span>
                              </div> : null;
                    })}
                        </div>
                      </div>

                      {/* X Separador */}
                      <div className="text-xl font-bold text-muted-foreground">
                        ✕
                      </div>

                      {/* Time Perdedor */}
                      <div className="flex-1 space-y-2">
                        <h4 className="text-purple-400 font-semibold text-center text-sm flex flex-col items-center gap-1">
                          Perdedor
                          {relatedBattle.loser_team_stigma && <img src={getStigmaById(relatedBattle.loser_team_stigma)?.imagem} alt="Estigma do time perdedor" className="w-6 h-6" />}
                        </h4>
                        <div className="flex gap-1 justify-center">
                          {relatedBattle.loser_team.slice(0, 3).map((knightId, index) => {
                      const knight = getKnightById(knightId);
                      return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                        e.stopPropagation();
                        window.location.href = `/knights?knight=${knight.id}`;
                      }}>
                                <img src={knight.image_url} alt={knight.name} className="w-8 h-8 rounded-full border border-purple-400/20 hover:border-purple-400/40" />
                                <span className="text-xs text-purple-300 hover:text-purple-400 transition-colors">
                                  {knight.name}
                                </span>
                              </div> : null;
                    })}
                        </div>
                      </div>
                    </div>

                    {/* Informação do autor */}
                    <div className="absolute bottom-[-10px] right-[10px] bg-card px-2 py-1 rounded text-xs text-muted-foreground">
                      por {getProfileByUserId(relatedBattle.created_by)?.full_name || 'Usuário'}
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>}

        {/* Comentários */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comentários
          </h3>

          {/* Lista de comentários */}
          <div className="space-y-4 mb-6">
            {getMainComments().map(comment => <Card key={comment.id} className="bg-card border-border relative">
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2">
                    <AdminDeleteButton onDelete={() => deleteComment(comment.id)} itemType="comentário" className="w-5 h-5 p-0" />
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">
                          {getProfileByUserId(comment.user_id)?.full_name || 'Usuário'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                        </span>
                      </div>
                      <p className="text-foreground mb-3">{comment.content}</p>
                      
                      {user && <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-accent p-0 h-auto">
                          <Reply className="w-4 h-4 mr-1" />
                          Responder
                        </Button>}

                      {/* Formulário de resposta */}
                      {replyingTo === comment.id && <div className="mt-3 flex gap-2">
                          <Input value={replyContent} onChange={e => setReplyContent(e.target.value)} className="flex-1 bg-background border-0" />
                          <Button onClick={() => handleReply(comment.id)} disabled={!replyContent.trim()} size="sm" className="bg-gradient-cosmic text-white hover:opacity-90">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>}

                      {/* Respostas */}
                      {getCommentReplies(comment.id).map(reply => <div key={reply.id} className="mt-4 ml-6 pl-4 border-l-2 border-border relative">
                          <div className="absolute top-0 right-0">
                            <AdminDeleteButton onDelete={() => deleteComment(reply.id)} itemType="comentário" className="w-4 h-4 p-0" />
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-foreground">
                              {getProfileByUserId(reply.user_id)?.full_name || 'Usuário'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                            </span>
                          </div>
                          <p className="text-foreground">{reply.content}</p>
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>)}

            {getMainComments().length === 0 && <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Seja o primeiro a comentar esta batalha!
                  </p>
                </CardContent>
              </Card>}
          </div>

          {/* Formulário de novo comentário */}
          {user ? <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 min-h-[80px] bg-background border-0" />
                  <Button onClick={handleComment} disabled={!newComment.trim()} className="self-end bg-gradient-cosmic text-white hover:opacity-90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card> : <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">
                  <Link to="/auth" className="text-accent hover:underline">
                    Faça login
                  </Link>{" "}
                  para comentar
                </p>
              </CardContent>
            </Card>}
        </div>
      </div>
      <Footer />
    </div>;
};
export default BattleDetail;