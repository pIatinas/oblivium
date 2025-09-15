import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sword, Trophy, Users, Zap, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BattleCard from "@/components/BattleCard";
import { createKnightUrl } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from "@/components/ui/carousel";
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
interface Stats {
  totalBattles: number;
  totalKnights: number;
  totalVictories: number;
}
const Index = () => {
  const [stats, setStats] = useState<Stats>({
    totalBattles: 0,
    totalKnights: 0,
    totalVictories: 0
  });
  const [topKnights, setTopKnights] = useState<Knight[]>([]);
  const [recentBattles, setRecentBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionCarouselApi, setActionCarouselApi] = useState<any>();
  const [statsCarouselApi, setStatsCarouselApi] = useState<any>();
  const [knightsCarouselApi, setKnightsCarouselApi] = useState<any>();
  const [battlesCarouselApi, setBattlesCarouselApi] = useState<any>();
  const [actionSlideIndex, setActionSlideIndex] = useState(0);
  const [statsSlideIndex, setStatsSlideIndex] = useState(0);
  const [knightsSlideIndex, setKnightsSlideIndex] = useState(0);
  const [battlesSlideIndex, setBattlesSlideIndex] = useState(0);
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (!actionCarouselApi) return;
    const onSelect = () => {
      setActionSlideIndex(actionCarouselApi.selectedScrollSnap());
    };
    actionCarouselApi.on("select", onSelect);
    return () => actionCarouselApi.off("select", onSelect);
  }, [actionCarouselApi]);
  useEffect(() => {
    if (!statsCarouselApi) return;
    const onSelect = () => {
      setStatsSlideIndex(statsCarouselApi.selectedScrollSnap());
    };
    statsCarouselApi.on("select", onSelect);
    return () => statsCarouselApi.off("select", onSelect);
  }, [statsCarouselApi]);
  useEffect(() => {
    if (!knightsCarouselApi) return;
    const onSelect = () => {
      setKnightsSlideIndex(knightsCarouselApi.selectedScrollSnap());
    };
    knightsCarouselApi.on("select", onSelect);
    return () => knightsCarouselApi.off("select", onSelect);
  }, [knightsCarouselApi]);
  useEffect(() => {
    if (!battlesCarouselApi) return;
    const onSelect = () => {
      setBattlesSlideIndex(battlesCarouselApi.selectedScrollSnap());
    };
    battlesCarouselApi.on("select", onSelect);
    return () => battlesCarouselApi.off("select", onSelect);
  }, [battlesCarouselApi]);
  const fetchData = async () => {
    try {
      await Promise.all([fetchStats(), fetchTopKnights(), fetchRecentBattles(), fetchKnights(), fetchStigmas(), fetchProfiles()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStats = async () => {
    const [battlesRes, knightsRes] = await Promise.all([supabase.from('battles').select('*', {
      count: 'exact',
      head: true
    }), supabase.from('knights').select('*', {
      count: 'exact',
      head: true
    })]);
    const totalBattles = battlesRes.count || 0;
    const totalKnights = knightsRes.count || 0;
    setStats({
      totalBattles,
      totalKnights,
      totalVictories: totalBattles
    });
  };
  const fetchTopKnights = async () => {
    const {
      data: battles
    } = await supabase.from('battles').select('winner_team, loser_team');
    const knightCounts: {
      [key: string]: number;
    } = {};
    battles?.forEach(battle => {
      [...battle.winner_team, ...battle.loser_team].forEach(knightId => {
        knightCounts[knightId] = (knightCounts[knightId] || 0) + 1;
      });
    });
    const sortedKnightIds = Object.entries(knightCounts).sort(([, a], [, b]) => b - a).slice(0, 12).map(([id]) => id);
    const {
      data: knightsData
    } = await supabase.from('knights').select('*').in('id', sortedKnightIds);
    if (knightsData) {
      const orderedKnights = sortedKnightIds.map(id => knightsData.find(k => k.id === id)).filter(Boolean) as Knight[];
      setTopKnights(orderedKnights);
    }
  };
  const fetchRecentBattles = async () => {
    const {
      data
    } = await supabase.from('battles').select('*').order('created_at', {
      ascending: false
    }).limit(4);
    if (data) {
      setRecentBattles(data.map(battle => ({
        ...battle,
        meta: battle.meta || false
      })));
    }
  };
  const fetchKnights = async () => {
    const {
      data
    } = await supabase.from('knights').select('*');
    if (data) setKnights(data);
  };
  const fetchStigmas = async () => {
    const {
      data
    } = await supabase.from('stigmas').select('*');
    if (data) setStigmas(data);
  };
  const fetchProfiles = async () => {
    const {
      data
    } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data);
  };
  if (loading) {
    return <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto p-3 md:p-6 ">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-bold text-foreground mb-4 text-7xl mt-5 lg:mt-0 ">⚔️ </h1>
          <p className="text-yellow-400 mb-8 text-center text-3xl font-medium">Guerra dos Tronos</p>
        </div>

        {/* Action Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-6">
          <Link to="/create-battle">
            <Card className="bg-card hover:bg-card/70 duration-200 cursor-pointer border-none">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Cadastro</CardTitle>
                <CardDescription>Cadastre uma nova batalha</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/battles">
            <Card className="bg-card hover:bg-card/70 duration-200 cursor-pointer border-none">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-4">
                  <Sword className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Batalhas</CardTitle>
                <CardDescription>Veja as batalhas cadastradas</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/knights">
            <Card className="bg-card hover:bg-card/70 duration-200 cursor-pointer border-none">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">Cavaleiros</CardTitle>
                <CardDescription>Explore todos os cavaleiros</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Mobile Action Cards Carousel */}
        <div className="md:hidden mb-12">
          <Carousel className="w-full mb-6">
            <CarouselContent>
              <CarouselItem>
                <Link to="/create-battle">
                  <Card className="bg-card transition-colors cursor-pointer border-none">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground">Cadastro</CardTitle>
                      <CardDescription>Cadastre uma nova batalha</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </CarouselItem>
              <CarouselItem>
                <Link to="/battles">
                  <Card className="bg-card transition-colors cursor-pointer border-none">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-4">
                        <Sword className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground">Batalhas</CardTitle>
                      <CardDescription>Veja as batalhas cadastradas</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </CarouselItem>
              <CarouselItem>
                <Link to="/knights">
                  <Card className="bg-card transition-colors cursor-pointer border-none">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground">Cavaleiros</CardTitle>
                      <CardDescription>Explore todos os cavaleiros</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        {/* Estatísticas */}
        {/* Desktop Stats Grid */}
        <div className="hidden md:grid grid-cols-4 gap-6 mb-12">
          <Card className="bg-card border-none ">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="flex justify-center mb-4">
                <Sword className="w-9 h-9 lg:w-12 lg:h-12 text-accent" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{stats.totalBattles}</div>
              <p className="text-muted-foreground mt-2 lg:-mt-2 ">Batalhas</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none ">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-9 h-9 lg:w-12 lg:h-12 text-accent" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{stats.totalKnights}</div>
              <p className="text-muted-foreground">Cavaleiros</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none ">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="w-9 h-9 lg:w-12 lg:h-12 text-accent" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{stats.totalVictories}</div>
              <p className="text-muted-foreground">Vitórias</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-none ">
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-9 h-9 lg:w-12 lg:h-12 text-accent" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{profiles.length}</div>
              <p className="text-muted-foreground">Membros</p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Stats Carousel */}
        <div className="md:hidden mb-12">
          <Carousel className="w-full mb-6">
            <CarouselContent>
              <CarouselItem>
                <Card className="bg-card border-none">
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-4">
                      <Sword className="w-9 h-9 text-accent" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-2">{stats.totalBattles}</div>
                    <p className="text-muted-foreground">Batalhas</p>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="bg-card border-none">
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-4">
                      <Users className="w-9 h-9 text-accent" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-2">{stats.totalKnights}</div>
                    <p className="text-muted-foreground">Cavaleiros</p>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="bg-card border-none">
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-4">
                      <Trophy className="w-9 h-9 text-accent" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-2">{stats.totalVictories}</div>
                    <p className="text-muted-foreground">Vitórias</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        {/* Principais Cavaleiros */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap">
            <h2 className="text-xl lg:text-3xl font-light text-foreground leading-none ">
              Principais <span className="font-bold">Cavaleiros</span>
            </h2>
            <Button asChild variant="outline" className="bg-card border-border">
              <Link to="/knights">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Link>
            </Button>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden md:grid gap-2 lg:gap-6 md:grid-cols-6 xl:grid-cols-8">
            {topKnights.map(knight => {
            const knightUrl = createKnightUrl(knight.id, knight.name);
            return <Link key={knight.id} to={`/knight/${knightUrl}`}>
                <Card className="bg-card hover:bg-card/7 hover:scale-110 transition-all duration-200 cursor-pointer border-none shadow-lg">
                  <CardContent className="p-4 text-center">
                    <img src={knight.image_url} alt={knight.name} className="w-16 h-16 rounded-full mx-auto mb-3 border border-accent/20" />
                    <p className="text-sm font-medium text-foreground">{knight.name}</p>
                  </CardContent>
                </Card>
              </Link>;
          })}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel className="w-full" setApi={setKnightsCarouselApi}>
              <CarouselContent className="-ml-2">
                {topKnights.map(knight => {
                const knightUrl = createKnightUrl(knight.id, knight.name);
                return <CarouselItem key={knight.id} className="pl-2 basis-1/2">
                    <Link to={`/knight/${knightUrl}`}>
                      <Card className="bg-card transition-all duration-200 cursor-pointer border-none shadow-lg">
                        <CardContent className="p-4 text-center">
                          <img src={knight.image_url} alt={knight.name} className="w-16 h-16 rounded-full mx-auto mb-3 border border-accent/20" />
                          <p className="text-sm font-medium text-foreground">{knight.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>;
              })}
              </CarouselContent>
            </Carousel>
            <CarouselDots count={Math.ceil(topKnights.length / 2)} current={knightsSlideIndex} />
          </div>
        </div>

        {/* Batalhas Recentes */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap">
            <h2 className="text-xl lg:text-3xl font-light text-foreground leading-none ">
              Últimas <span className="font-bold">Batalhas</span>
            </h2>
            <Button asChild variant="outline" className="bg-card border-border">
              <Link to="/battles">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas
              </Link>
            </Button>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {recentBattles.map(battle => <div key={battle.id} className="hover:scale-[1.02] transition-transform">
                <BattleCard battle={battle} knights={knights} stigmas={stigmas} profiles={profiles} onDelete={fetchRecentBattles} />
              </div>)}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel className="w-full" setApi={setBattlesCarouselApi}>
              <CarouselContent>
                {recentBattles.map(battle => <CarouselItem key={battle.id}>
                    <div className="transition-transform">
                      <BattleCard battle={battle} knights={knights} stigmas={stigmas} profiles={profiles} onDelete={fetchRecentBattles} />
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
            </Carousel>
            <CarouselDots count={recentBattles.length} current={battlesSlideIndex} />
          </div>
        </div>
      </div>
      <Footer />
    </div>;
};
export default Index;