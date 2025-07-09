import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sword, Search, Plus, Archive, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
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
  created_at: string;
  created_by: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
}

const Index = () => {
  const [stats, setStats] = useState({
    users: 0,
    battles: 0,
    knights: 0
  });
  const [mostUsedKnights, setMostUsedKnights] = useState<Knight[]>([]);
  const [recentBattles, setRecentBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [usersRes, battlesRes, knightsRes, profilesRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('battles').select('*').order('created_at', { ascending: false }),
        supabase.from('knights').select('*'),
        supabase.from('profiles').select('*')
      ]);

      // Set stats
      setStats({
        users: usersRes.data?.length || 0,
        battles: battlesRes.data?.length || 0,
        knights: knightsRes.data?.length || 0
      });

      // Set data for other blocks
      setKnights(knightsRes.data || []);
      setProfiles(profilesRes.data || []);
      setRecentBattles(battlesRes.data?.slice(0, 4) || []);

      // Calculate most used knights
      const knightUsage: { [key: string]: number } = {};
      battlesRes.data?.forEach(battle => {
        [...battle.winner_team, ...battle.loser_team].forEach(knightId => {
          knightUsage[knightId] = (knightUsage[knightId] || 0) + 1;
        });
      });

      const sortedKnights = Object.entries(knightUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 14)
        .map(([knightId]) => knightsRes.data?.find(k => k.id === knightId))
        .filter(Boolean) as Knight[];

      setMostUsedKnights(sortedKnights);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKnightById = (knightId: string) => {
    return knights.find(k => k.id === knightId);
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Guerra dos Tronos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Guia para consulta de lutas da Guerra dos Tronos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Registrar Batalha */}
          <Card className="bg-card hover:scale-105 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-accent">Cadastrar Batalha</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Adicione uma nova batalha
              </p>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-[#f8cc34] hover:text-[#0a0a0b]">
                <Link to="/create-battle">
                  Cadastrar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ver Batalhas */}
          <Card className="bg-card hover:scale-105 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Archive className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-foreground">Batalhas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Consulte todas as batalhas registradas
              </p>
              <Button asChild variant="outline" className="text-accent hover:bg-[#f8cc34] hover:text-[#0a0a0b]">
                <Link to="/battles">
                  Ver Batalhas
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Cavaleiros */}
          <Card className="bg-card hover:scale-105 transition-all duration-300 group md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-foreground">Cavaleiros</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Consultar cavaleiros
              </p>
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-[#f8cc34] hover:text-[#0a0a0b]">
                <Link to="/knights">
                  Ver Cavaleiros
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats, Most Used Knights, and Recent Battles will be added here */}
        <div className="space-y-8">
          {/* Stats Section */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8">
            <h3 className="text-2xl font-bold text-center text-foreground mb-6">
              Estatísticas
            </h3>
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">
                  {loading ? '-' : stats.users}
                </div>
                <div className="text-muted-foreground">Membros</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">
                  {loading ? '-' : stats.battles}
                </div>
                <div className="text-muted-foreground">Batalhas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">
                  {loading ? '-' : stats.knights}
                </div>
                <div className="text-muted-foreground">Cavaleiros</div>
              </div>
            </div>
          </div>

          {/* Most Used Knights Section */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                Mais Usados
              </h3>
              <Button asChild variant="outline" className="text-accent hover:bg-[#f8cc34] hover:text-[#0a0a0b]">
                <Link to="/knights">
                  Ver Todos
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-4">
              {mostUsedKnights.slice(0, 14).map((knight) => (
                <Link key={knight.id} to={`/knights?knight=${knight.id}`} className="text-center hover:opacity-80 transition-opacity">
                  <img
                    src={knight.image_url}
                    alt={knight.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-accent/20"
                  />
                  <p className="text-sm text-foreground font-medium">{knight.name}</p>
                </Link>
              ))}
              {mostUsedKnights.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8 col-span-7">
                  Nenhum cavaleiro usado ainda
                </p>
              )}
              {loading && (
                <p className="text-center text-muted-foreground py-8 col-span-7">
                  Carregando...
                </p>
              )}
            </div>
          </div>

          {/* Recent Battles Section */}
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                Últimas Batalhas
              </h3>
              <Button asChild variant="outline" className="text-accent hover:bg-[#f8cc34] hover:text-[#0a0a0b]">
                <Link to="/battles">
                  Ver Todas
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {recentBattles.slice(0, 4).map((battle) => (
                <Card key={battle.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Time Vencedor */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-accent mb-2">🏆 Vencedor</p>
                        <div className="flex gap-2">
                          {battle.winner_team.slice(0, 3).map((knightId, index) => {
                            const knight = getKnightById(knightId);
                            return knight ? (
                              <Link key={index} to={`/knights?knight=${knight.id}`} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                <img
                                  src={knight.image_url}
                                  alt={knight.name}
                                  className="w-6 h-6 rounded-full border border-accent/20"
                                />
                                <span className="text-xs text-foreground">{knight.name}</span>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* X Separador */}
                      <div className="text-xl font-bold text-muted-foreground">
                        ✕
                      </div>

                      {/* Time Perdedor */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-400 mb-2">💀 Perdedor</p>
                        <div className="flex gap-2">
                          {battle.loser_team.slice(0, 3).map((knightId, index) => {
                            const knight = getKnightById(knightId);
                            return knight ? (
                              <Link key={index} to={`/knights?knight=${knight.id}`} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                <img
                                  src={knight.image_url}
                                  alt={knight.name}
                                  className="w-6 h-6 rounded-full border border-purple-400/20"
                                />
                                <span className="text-xs text-foreground">{knight.name}</span>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <p className="text-xs text-muted-foreground">
                        Cadastrado por {getProfileByUserId(battle.created_by)?.full_name || 'Usuário'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {recentBattles.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-8 col-span-2">
                  Nenhuma batalha cadastrada ainda
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
