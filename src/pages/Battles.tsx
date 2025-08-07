
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
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
  tipo: string;
  meta: boolean | null;
  created_at: string;
  created_by: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
}

const Battles = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredBattles, setFilteredBattles] = useState<Battle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBattles();
    fetchKnights();
    fetchStigmas();
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterBattles();
  }, [battles, searchTerm, selectedType]);

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBattles((data || []).map((battle: any) => ({
        ...battle,
        meta: battle.meta || false,
      })));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as batalhas",
        variant: "destructive",
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

  const getStigmaById = (stigmaId: string) => {
    return stigmas.find(s => s.id === stigmaId);
  };

  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  const filterBattles = () => {
    let filtered = battles;

    // Filter by type
    if (selectedType !== "Todos") {
      filtered = filtered.filter(battle => battle.tipo === selectedType);
    }

    // Filter by search term (knight names)
    if (searchTerm) {
      filtered = filtered.filter(battle => {
        const allKnights = [...battle.winner_team, ...battle.loser_team];
        return allKnights.some(knightId => {
          const knight = getKnightById(knightId);
          return knight && knight.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    setFilteredBattles(filtered);
  };

  const battleTypes = ["Todos", "Padrão", "Athena", "Econômico", "Hades", "Lua", "Poseidon"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando batalhas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Batalhas
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por cavaleiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48 bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {battleTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button asChild className="bg-gradient-cosmic text-white hover:opacity-90">
              <Link to="/create-battle">
                <Plus className="w-4 h-4 mr-2" />
                Nova Batalha
              </Link>
            </Button>
          </div>
        </div>

        {/* Battles Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {filteredBattles.length > 0 ? (
            filteredBattles.map((battle) => (
              <Link key={battle.id} to={`/battles/${battle.id}`}>
                <Card className="bg-card hover:bg-card/80 transition-all duration-300 relative border-none shadow-none cursor-pointer">
                  {battle.meta && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
                      <span className="text-black text-xl">⭐</span>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      {/* Winner Team */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-accent font-semibold text-center flex flex-col items-center gap-2 text-lg">
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
                                className="flex flex-col items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  src={knight.image_url}
                                  alt={knight.name}
                                  className="w-10 h-10 rounded-full border border-accent/20"
                                />
                                <span className="text-xs text-foreground">
                                  {knight.name}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* X Separator */}
                      <div className="text-2xl font-bold text-muted-foreground">
                        ✕
                      </div>

                      {/* Loser Team */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-purple-400 font-semibold text-center flex flex-col items-center gap-2 text-lg">
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
                                className="flex flex-col items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  src={knight.image_url}
                                  alt={knight.name}
                                  className="w-10 h-10 rounded-full border border-purple-400/20"
                                />
                                <span className="text-xs text-purple-300">
                                  {knight.name}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline" className="border-accent/20 text-accent">
                        {battle.tipo}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(battle.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Author info */}
                    <div className="absolute bottom-[-10px] right-[10px] bg-card px-2 py-1 rounded text-xs text-muted-foreground">
                      por {getProfileByUserId(battle.created_by)?.full_name || 'Usuário'}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {searchTerm || selectedType !== "Todos" 
                  ? "Nenhuma batalha encontrada com os filtros aplicados." 
                  : "Nenhuma batalha registrada ainda."
                }
              </p>
              {!searchTerm && selectedType === "Todos" && (
                <Button asChild>
                  <Link to="/create-battle">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira batalha
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Battles;
