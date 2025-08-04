import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";

interface Knight {
  id: string;
  name: string;
  image_url: string;
}

interface Battle {
  id: string;
  winner_team: string[];
  loser_team: string[];
  meta: boolean | null;
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

const BattleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [relatedBattles, setRelatedBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBattleDetail();
      fetchKnights();
      fetchProfiles();
    }
  }, [id]);

  useEffect(() => {
    if (battle && knights.length > 0) {
      fetchRelatedBattles();
    }
  }, [id]);

  const fetchBattleDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .eq('id', id)
        .single();
      
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
    } finally {
      setLoading(false);
    }
  };

  const fetchKnights = async () => {
    try {
      const { data, error } = await supabase
        .from('knights')
        .select('*');
      
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cavaleiros:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const getKnightById = (knightId: string) => {
    return knights.find(k => k.id === knightId);
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  const fetchRelatedBattles = async () => {
    if (!battle) return;
    
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .neq('id', battle.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter battles that contain any knight from the winner team  
      const filtered = (data || []).filter((b: any) => {
        return battle.winner_team.some(knightId => 
          [...b.winner_team, ...b.loser_team].includes(knightId)
        );
      }).map((b: any) => ({
        ...b,
        meta: b.meta || false
      })).slice(0, 6);
      
      setRelatedBattles(filtered);
    } catch (error: any) {
      console.error('Erro ao carregar batalhas relacionadas:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando detalhes da batalha...</div>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-nebula">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <Breadcrumb battleId={id} />
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Detalhe da Batalha
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vencedor */}
          <Card className="bg-card border-accent border-[3px] relative">
            {battle.meta && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                <span className="text-black text-sm">⭐</span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-accent text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div>Vencedor</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 min-h-[200px]">
                {battle.winner_team.map((knightId, index) => {
                  const knight = getKnightById(knightId);
                  return knight ? (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-center gap-3">
                        <img 
                          src={knight.image_url} 
                          alt={knight.name} 
                          className="w-10 h-10 rounded-full border border-accent/20" 
                        />
                        <span className="text-foreground font-medium">
                          {knight.name}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Perdedor */}
          <Card className="bg-card border-purple-400 border-[3px] relative">
            <CardHeader>
              <CardTitle className="text-purple-400 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">💀</div>
                  <div>Perdedor</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 min-h-[200px]">
                {battle.loser_team.map((knightId, index) => {
                  const knight = getKnightById(knightId);
                  return knight ? (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-400/5 rounded-lg border border-purple-400/20">
                      <div className="flex items-center gap-3">
                        <img 
                          src={knight.image_url} 
                          alt={knight.name} 
                          className="w-10 h-10 rounded-full border border-purple-400/20" 
                        />
                        <span className="text-foreground font-medium">
                          {knight.name}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações da batalha */}
        <Card className="bg-card/50 backdrop-blur-sm border-none mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Criado por: {getProfileByUserId(battle.created_by)?.full_name || 'Usuário'}
              </div>
              <div>
                {new Date(battle.created_at).toLocaleDateString('pt-BR')} às {new Date(battle.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batalhas Relacionadas */}
        {relatedBattles.length > 0 && (
          <Card className="bg-card border-none mt-8">
            <CardHeader>
              <CardTitle className="text-foreground text-center">
                Batalhas Relacionadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedBattles.map((relatedBattle) => (
                  <Card key={relatedBattle.id} className="bg-card hover:bg-card/90 transition-all duration-300 relative border border-border hover:border-accent/50 shadow-none cursor-pointer" onClick={() => window.location.href = `/battles/${relatedBattle.id}`}>
                    {relatedBattle.meta && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                        <span className="text-black text-xs">⭐</span>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Time Vencedor */}
                        <div className="flex-1 space-y-2">
                          <h4 className="text-accent font-semibold text-center text-sm">
                            Vencedor
                          </h4>
                          <div className="flex gap-1 justify-center">
                            {relatedBattle.winner_team.slice(0, 3).map((knightId, index) => {
                              const knight = getKnightById(knightId);
                              return knight ? (
                                <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); window.location.href = `/knights?knight=${knight.id}`; }}>
                                  <img
                                    src={knight.image_url}
                                    alt={knight.name}
                                    className="w-6 h-6 rounded-full border border-accent/20 hover:border-accent/40"
                                  />
                                  <span className="text-xs text-foreground hover:text-accent transition-colors">
                                    {knight.name}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                        {/* X Separador */}
                        <div className="text-xl font-bold text-muted-foreground">
                          ✕
                        </div>

                        {/* Time Perdedor */}
                        <div className="flex-1 space-y-2">
                          <h4 className="text-purple-400 font-semibold text-center text-sm">
                            Perdedor
                          </h4>
                          <div className="flex gap-1 justify-center">
                            {relatedBattle.loser_team.slice(0, 3).map((knightId, index) => {
                              const knight = getKnightById(knightId);
                              return knight ? (
                                <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); window.location.href = `/knights?knight=${knight.id}`; }}>
                                  <img
                                    src={knight.image_url}
                                    alt={knight.name}
                                    className="w-6 h-6 rounded-full border border-purple-400/20 hover:border-purple-400/40"
                                  />
                                  <span className="text-xs text-purple-300 hover:text-purple-400 transition-colors">
                                    {knight.name}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BattleDetail;