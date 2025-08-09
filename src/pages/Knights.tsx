
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Sword } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import CreateKnightModal from "@/components/CreateKnightModal";
import BattleCard from "@/components/BattleCard";

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

interface KnightStats {
  totalBattles: number;
  victories: number;
  defeats: number;
  winRate: number;
}

const Knights = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKnightId = searchParams.get("knight");

  const [knights, setKnights] = useState<Knight[]>([]);
  const [filteredKnights, setFilteredKnights] = useState<Knight[]>([]);
  const [selectedKnight, setSelectedKnight] = useState<Knight | null>(null);
  const [knightBattles, setKnightBattles] = useState<Battle[]>([]);
  const [knightStats, setKnightStats] = useState<KnightStats>({
    totalBattles: 0,
    victories: 0,
    defeats: 0,
    winRate: 0
  });
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedKnightId && knights.length > 0) {
      const knight = knights.find(k => k.id === selectedKnightId);
      if (knight) {
        setSelectedKnight(knight);
        fetchKnightBattles(knight.id);
      }
    }
  }, [selectedKnightId, knights]);

  useEffect(() => {
    filterKnights();
  }, [knights, searchTerm]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchKnights(), fetchStigmas(), fetchProfiles()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnights = async () => {
    const { data, error } = await supabase
      .from('knights')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar cavaleiros:', error);
      return;
    }
    
    setKnights(data || []);
  };

  const fetchStigmas = async () => {
    const { data } = await supabase.from('stigmas').select('*');
    if (data) setStigmas(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data);
  };

  const fetchKnightBattles = async (knightId: string) => {
    const { data: battles } = await supabase
      .from('battles')
      .select('*')
      .or(`winner_team.cs.{${knightId}},loser_team.cs.{${knightId}}`)
      .order('created_at', { ascending: false });

    if (battles) {
      setKnightBattles(battles);
      calculateKnightStats(battles, knightId);
    }
  };

  const calculateKnightStats = (battles: Battle[], knightId: string) => {
    const totalBattles = battles.length;
    const victories = battles.filter(battle => battle.winner_team.includes(knightId)).length;
    const defeats = battles.filter(battle => battle.loser_team.includes(knightId)).length;
    const winRate = totalBattles > 0 ? (victories / totalBattles) * 100 : 0;

    setKnightStats({
      totalBattles,
      victories,
      defeats,
      winRate
    });
  };

  const filterKnights = () => {
    if (!searchTerm) {
      setFilteredKnights(knights);
      return;
    }

    const filtered = knights.filter(knight => 
      knight.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKnights(filtered);
  };

  const selectKnight = (knight: Knight) => {
    setSelectedKnight(knight);
    setSearchParams({ knight: knight.id });
    fetchKnightBattles(knight.id);
  };

  const clearSelection = () => {
    setSelectedKnight(null);
    setSearchParams({});
    setKnightBattles([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando cavaleiros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-3 lg:p-6">
        <Breadcrumb knightName={selectedKnight?.name} />
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-foreground">Cavaleiros</h1>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-gradient-cosmic text-white hover:opacity-90"
            >
              Adicionar Cavaleiro
            </Button>
          </div>
          <p className="text-muted-foreground text-center">
            Explore todos os cavaleiros e suas estatísticas de batalha
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Knights List */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar cavaleiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredKnights.map((knight) => (
                <Card 
                  key={knight.id} 
                  className={`cursor-pointer transition-all duration-200 border-none ${
                    selectedKnight?.id === knight.id 
                      ? 'bg-accent/10 border-accent shadow-lg' 
                      : 'bg-card hover:bg-card/70'
                  }`}
                  onClick={() => selectKnight(knight)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={knight.image_url} 
                        alt={knight.name} 
                        className="w-12 h-12 rounded-full border border-accent/20"
                      />
                      <div>
                        <h3 className="font-medium text-foreground">{knight.name}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredKnights.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cavaleiro encontrado.
              </p>
            )}
          </div>

          {/* Knight Details */}
          <div className="lg:col-span-2">
            {selectedKnight ? (
              <div className="space-y-6">
                {/* Knight Info */}
                <Card className="bg-card border-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={selectedKnight.image_url} 
                          alt={selectedKnight.name} 
                          className="w-16 h-16 rounded-full border-2 border-accent"
                        />
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{selectedKnight.name}</h2>
                          <p className="text-muted-foreground">Cavaleiro de Atena</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-background rounded-lg">
                        <div className="flex justify-center mb-2">
                          <Sword className="w-6 h-6 text-accent" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{knightStats.totalBattles}</div>
                        <div className="text-sm text-muted-foreground">Batalhas</div>
                      </div>
                      
                      <div className="text-center p-4 bg-background rounded-lg">
                        <div className="flex justify-center mb-2">
                          <Trophy className="w-6 h-6 text-accent" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">{knightStats.victories}</div>
                        <div className="text-sm text-muted-foreground">Vitórias</div>
                      </div>
                      
                      <div className="text-center p-4 bg-background rounded-lg">
                        <div className="flex justify-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">L</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{knightStats.defeats}</div>
                        <div className="text-sm text-muted-foreground">Derrotas</div>
                      </div>
                      
                      <div className="text-center p-4 bg-background rounded-lg">
                        <div className="flex justify-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-cosmic flex items-center justify-center">
                            <span className="text-xs text-white font-bold">%</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{knightStats.winRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Knight Battles */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Histórico de Batalhas ({knightBattles.length})
                  </h3>
                  
                  {knightBattles.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {knightBattles.map((battle) => (
                        <div key={battle.id} className="relative">
                          <BattleCard 
                            battle={battle} 
                            knights={knights} 
                            stigmas={stigmas} 
                            profiles={profiles}
                            onDelete={() => fetchKnightBattles(selectedKnight.id)}
                            selectedKnightId={selectedKnight.id}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-card border-none">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                          Este cavaleiro ainda não participou de nenhuma batalha.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card className="bg-card border-none h-full">
                <CardContent className="p-8 text-center flex items-center justify-center h-full">
                  <div>
                    <div className="text-6xl mb-4">⚔️</div>
                    <p className="text-muted-foreground text-lg">
                      Selecione um cavaleiro para ver seus detalhes e histórico de batalhas
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <CreateKnightModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onKnightCreated={() => {
          fetchKnights();
          setShowCreateModal(false);
        }}
      />
      
      <Footer />
    </div>
  );
};

export default Knights;
