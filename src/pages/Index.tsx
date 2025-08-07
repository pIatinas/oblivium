
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

interface Battle {
  id: string;
  winner_team: string[];
  loser_team: string[];
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
  const [recentBattles, setRecentBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchRecentBattles();
    fetchKnights();
  }, []);

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

  const fetchRecentBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentBattles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar batalhas recentes:', error);
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

  const getKnightById = (knightId: string) => {
    return knights.find(k => k.id === knightId);
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

        {/* Recent Battles */}
        <Card className="bg-card/60 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle className="text-foreground">Batalhas Recentes</CardTitle>
            <CardDescription>
              Últimas batalhas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentBattles.length > 0 ? (
              <div className="space-y-4">
                {recentBattles.map((battle) => (
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

            {recentBattles.length > 0 && (
              <div className="mt-6 text-center">
                <Button asChild variant="outline">
                  <Link to="/battles">
                    Ver Todas as Batalhas
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
