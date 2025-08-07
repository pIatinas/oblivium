
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Stats {
  totalBattles: number;
  totalKnights: number;
  recentBattles: number;
}

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
  created_at: string;
  meta: boolean | null;
  tipo: string;
}

const Index = () => {
  const [stats, setStats] = useState<Stats>({
    totalBattles: 0,
    totalKnights: 0,
    recentBattles: 0,
  });
  const [topKnights, setTopKnights] = useState<Knight[]>([]);
  const [latestBattles, setLatestBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchKnights();
    fetchStigmas();
    fetchLatestBattles();
  }, []);

  useEffect(() => {
    if (knights.length > 0) {
      calculateTopKnights();
    }
  }, [knights]);

  const fetchStats = async () => {
    try {
      // Fetch total battles
      const { count: battlesCount, error: battlesError } = await supabase
        .from('battles')
        .select('*', { count: 'exact', head: true });

      if (battlesError) throw battlesError;

      // Fetch total knights
      const { count: knightsCount, error: knightsError } = await supabase
        .from('knights')
        .select('*', { count: 'exact', head: true });

      if (knightsError) throw knightsError;

      // Fetch recent battles (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentCount, error: recentError } = await supabase
        .from('battles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      setStats({
        totalBattles: battlesCount || 0,
        totalKnights: knightsCount || 0,
        recentBattles: recentCount || 0,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
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
    } finally {
      setLoading(false);
    }
  };

  const fetchStigmas = async () => {
    try {
      const { data, error } = await supabase
        .from('stigmas')
        .select('*');

      if (error) throw error;
      setStigmas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estigmas:', error);
    }
  };

  const fetchLatestBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setLatestBattles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar últimas batalhas:', error);
    }
  };

  const calculateTopKnights = async () => {
    try {
      const { data: battles, error } = await supabase
        .from('battles')
        .select('winner_team, loser_team');

      if (error) throw error;

      const knightUsage: { [key: string]: number } = {};

      battles?.forEach((battle) => {
        [...battle.winner_team, ...battle.loser_team].forEach((knightId) => {
          knightUsage[knightId] = (knightUsage[knightId] || 0) + 1;
        });
      });

      const sortedKnights = Object.entries(knightUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 16)
        .map(([knightId]) => knights.find(k => k.id === knightId))
        .filter(Boolean) as Knight[];

      setTopKnights(sortedKnights);
    } catch (error: any) {
      console.error('Erro ao calcular cavaleiros mais utilizados:', error);
    }
  };

  const getKnightById = (knightId: string) => {
    return knights.find(k => k.id === knightId);
  };

  const getStigmaById = (stigmaId: string) => {
    return stigmas.find(s => s.id === stigmaId);
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
          <div className="text-8xl mb-4">⚔️</div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Oblivium
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gerenciador de Batalhas
          </p>
          <Button asChild size="lg" className="bg-gradient-cosmic text-white hover:opacity-90">
            <Link to="/create-battle">
              <Plus className="w-5 h-5 mr-2" />
              Nova Batalha
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="bg-card/60 backdrop-blur-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Batalhas
              </CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalBattles}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cavaleiros
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalKnights}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Batalhas Recentes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.recentBattles}</div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Principais Cavaleiros */}
        <Card className="bg-card/60 backdrop-blur-sm border-none mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">
              Principais <span className="font-bold">Cavaleiros</span>
            </CardTitle>
            <CardDescription>
              Os cavaleiros mais utilizados nas batalhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topKnights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8 mb-6">
                {topKnights.map((knight) => (
                  <Link 
                    key={knight.id} 
                    to={`/knights?knight=${knight.id}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-background/50 transition-colors"
                  >
                    <img
                      src={knight.image_url}
                      alt={knight.name}
                      className="w-12 h-12 rounded-full border-2 border-accent/20"
                    />
                    <span className="text-xs text-center text-foreground">
                      {knight.name}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cavaleiro encontrado ainda.
              </p>
            )}

            <div className="text-center">
              <Button asChild variant="outline">
                <Link to="/knights">
                  Ver Todos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Últimas Batalhas */}
        <Card className="bg-card/60 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle className="text-foreground">
              Últimas <span className="font-bold">Batalhas</span>
            </CardTitle>
            <CardDescription>
              Últimas batalhas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestBattles.length > 0 ? (
              <div className="space-y-4 mb-6">
                {latestBattles.map((battle) => (
                  <Link 
                    key={battle.id} 
                    to={`/battles/${battle.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-pointer relative">
                      {battle.meta && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10 bg-transparent">
                          <span className="text-black text-sm">⭐</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-6 flex-1">
                        {/* Winner Team */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-accent">Vencedor:</span>
                          {battle.winner_team_stigma && (
                            <img 
                              src={getStigmaById(battle.winner_team_stigma)?.imagem} 
                              alt="Estigma do time vencedor" 
                              className="w-10 h-10" 
                            />
                          )}
                          <div className="flex -space-x-2">
                            {battle.winner_team.slice(0, 3).map((knightId, index) => {
                              const knight = getKnightById(knightId);
                              return knight ? (
                                <img
                                  key={index}
                                  src={knight.image_url}
                                  alt={knight.name}
                                  className="w-8 h-8 rounded-full border-2 border-background"
                                  title={knight.name}
                                />
                              ) : null;
                            })}
                          </div>
                        </div>

                        <div className="text-lg text-muted-foreground">×</div>

                        {/* Loser Team */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-purple-400">Perdedor:</span>
                          {battle.loser_team_stigma && (
                            <img 
                              src={getStigmaById(battle.loser_team_stigma)?.imagem} 
                              alt="Estigma do time perdedor" 
                              className="w-10 h-10" 
                            />
                          )}
                          <div className="flex -space-x-2">
                            {battle.loser_team.slice(0, 3).map((knightId, index) => {
                              const knight = getKnightById(knightId);
                              return knight ? (
                                <img
                                  key={index}
                                  src={knight.image_url}
                                  alt={knight.name}
                                  className="w-8 h-8 rounded-full border-2 border-background"
                                  title={knight.name}
                                />
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(battle.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {battle.tipo}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma batalha registrada ainda.
              </p>
            )}

            <div className="text-center">
              <Button asChild variant="outline">
                <Link to="/battles">
                  Ver Todas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
