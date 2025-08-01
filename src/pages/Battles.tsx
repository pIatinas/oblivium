import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
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
  created_at: string;
  created_by: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
}

const Battles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBattles();
    fetchKnights();
    fetchProfiles();
  }, []);

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBattles(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as batalhas",
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

  const filteredBattles = battles.filter(battle => {
    const allKnights = [...battle.winner_team, ...battle.loser_team];
    return allKnights.some(knightId => {
      const knight = getKnightById(knightId);
      return knight && knight.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

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
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Busca"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredBattles.map((battle) => (
            <Card key={battle.id} className="bg-card hover:bg-card/90 transition-all duration-300 relative border-none shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Time Vencedor */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-accent font-semibold text-center flex items-center justify-center gap-2">
                      Vencedor
                    </h3>
                    <div className="flex gap-2 justify-center">
                      {battle.winner_team.slice(0, 3).map((knightId, index) => {
                        const knight = getKnightById(knightId);
                        return knight ? (
                          <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => window.location.href = `/knights?knight=${knight.id}`}>
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
                    <h3 className="text-purple-400 font-semibold text-center flex items-center justify-center gap-2">
                      Perdedor
                    </h3>
                    <div className="flex gap-2 justify-center">
                      {battle.loser_team.slice(0, 3).map((knightId, index) => {
                        const knight = getKnightById(knightId);
                        return knight ? (
                          <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => window.location.href = `/knights?knight=${knight.id}`}>
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

        {filteredBattles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? `Nenhuma batalha encontrada para "${searchTerm}"` : "Nenhuma batalha cadastrada"}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Battles;