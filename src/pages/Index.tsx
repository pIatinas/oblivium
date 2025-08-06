
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
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
}

interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
}

interface Stats {
  totalBattles: number;
  totalKnights: number;
  metaAttacks: number;
  battlesByType: { [key: string]: number };
}

const Index = () => {
  const [recentBattles, setRecentBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBattles: 0,
    totalKnights: 0,
    metaAttacks: 0,
    battlesByType: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent battles
      const { data: battlesData, error: battlesError } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (battlesError) throw battlesError;

      // Fetch knights
      const { data: knightsData, error: knightsError } = await supabase
        .from('knights')
        .select('*');

      if (knightsError) throw knightsError;

      // Fetch stigmas
      const { data: stigmasData, error: stigmasError } = await supabase
        .from('stigmas')
        .select('*');

      if (stigmasError) throw stigmasError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      setRecentBattles(battlesData || []);
      setKnights(knightsData || []);
      setStigmas(stigmasData || []);
      setProfiles(profilesData || []);

      // Calculate stats
      const totalBattles = battlesData?.length || 0;
      const totalKnights = knightsData?.length || 0;
      const metaAttacks = battlesData?.filter(battle => battle.meta)?.length || 0;
      
      const battlesByType = (battlesData || []).reduce((acc: any, battle) => {
        acc[battle.tipo] = (acc[battle.tipo] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalBattles,
        totalKnights,
        metaAttacks,
        battlesByType
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-foreground mb-4">⚔️ Oblivium ⚔️</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gerenciador de Batalhas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-none shadow-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">{stats.totalBattles}</div>
              <div className="text-muted-foreground">Batalhas Registradas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-none shadow-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">{stats.totalKnights}</div>
              <div className="text-muted-foreground">Cavaleiros Ativos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-none shadow-none">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">{stats.metaAttacks}</div>
              <div className="text-muted-foreground">Meta de Ataques</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Battles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Batalhas Recentes</h2>
            <Link 
              to="/battles" 
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {recentBattles.map(battle => (
              <Card 
                key={battle.id} 
                className="bg-card hover:bg-card/80 transition-all duration-300 relative border-none shadow-none cursor-pointer"
                onClick={() => window.location.href = `/battles/${battle.id}`}
              >
                {battle.meta && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
                    <span className="text-black text-xl">⭐</span>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    {/* Time Vencedor */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-accent font-semibold text-center flex flex-col items-center gap-2">
                        Vencedor
                        {battle.winner_team_stigma && (
                          <img 
                            src={getStigmaById(battle.winner_team_stigma)?.imagem} 
                            alt="Estigma do time vencedor"
                            className="w-10 h-10"
                          />
                        )}
                      </h3>
                      <div className="flex gap-2 justify-center">
                        {battle.winner_team.slice(0, 3).map((knightId, index) => {
                          const knight = getKnightById(knightId);
                          return knight ? (
                            <div 
                              key={index} 
                              className="flex flex-col items-center gap-1 cursor-pointer"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                window.location.href = `/knights?knight=${knight.id}`; 
                              }}
                            >
                              <img
                                src={knight.image_url}
                                alt={knight.name}
                                className="w-8 h-8 rounded-full border border-accent/20 hover:border-accent/40"
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
                    <div className="text-3xl font-bold text-muted-foreground">
                      ✕
                    </div>

                    {/* Time Perdedor */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-purple-400 font-semibold text-center flex flex-col items-center gap-2">
                        Perdedor
                        {battle.loser_team_stigma && (
                          <img 
                            src={getStigmaById(battle.loser_team_stigma)?.imagem} 
                            alt="Estigma do time perdedor"
                            className="w-10 h-10"
                          />
                        )}
                      </h3>
                      <div className="flex gap-2 justify-center">
                        {battle.loser_team.slice(0, 3).map((knightId, index) => {
                          const knight = getKnightById(knightId);
                          return knight ? (
                            <div 
                              key={index} 
                              className="flex flex-col items-center gap-1 cursor-pointer"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                window.location.href = `/knights?knight=${knight.id}`; 
                              }}
                            >
                              <img
                                src={knight.image_url}
                                alt={knight.name}
                                className="w-8 h-8 rounded-full border border-purple-400/20 hover:border-purple-400/40"
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
                  
                  {/* Informação do autor */}
                  <div className="absolute bottom-[-10px] right-[10px] bg-card px-2 py-1 rounded text-xs text-muted-foreground">
                    por {getProfileByUserId(battle.created_by)?.full_name || 'Usuário'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {recentBattles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Nenhuma batalha registrada ainda
              </p>
              <Link 
                to="/create-battle"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gradient-cosmic text-white hover:opacity-90 h-10 px-4 py-2"
              >
                Cadastrar Primeira Batalha
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
