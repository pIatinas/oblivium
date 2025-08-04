import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import CreateKnightModal from "@/components/CreateKnightModal";
interface Knight {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}
interface Battle {
  id: string;
  winner_team: string[];
  loser_team: string[];
  created_at: string;
}
const Knights = () => {
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKnight, setSelectedKnight] = useState<Knight | null>(null);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchKnights();
    fetchBattles();
  }, []);

  // Handle knight selection from URL parameters
  useEffect(() => {
    const knightId = searchParams.get('knight');
    if (knightId && knights.length > 0) {
      const knight = knights.find(k => k.id === knightId);
      if (knight) {
        setSelectedKnight(knight);
      }
    }
  }, [searchParams, knights]);
  const fetchKnights = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('knights').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cavaleiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchBattles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('battles').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setBattles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar batalhas:', error);
    }
  };
  const filteredKnights = knights.filter(knight => knight.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const handleKnightClick = (knight: Knight) => {
    setSelectedKnight(knight);
  };
  const getKnightHistory = (knightId: string) => {
    const victories = battles.filter(battle => battle.winner_team.includes(knightId));
    const defeats = battles.filter(battle => battle.loser_team.includes(knightId));
    return {
      victories,
      defeats
    };
  };
  const handleKnightCreated = () => {
    fetchKnights();
  };
  const getKnightName = (knightId: string) => {
    const knight = knights.find(k => k.id === knightId);
    return knight ? knight.name : "Cavaleiro removido";
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando cavaleiros...</div>
        </div>
      </div>;
  }
  const knightHistory = selectedKnight ? getKnightHistory(selectedKnight.id) : null;
  return <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb knightName={selectedKnight?.name} />
        {!selectedKnight ? <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
              Cavaleiros
            </h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-card border-border w-64" />
              </div>
              
              <Button onClick={() => setShowModal(true)} className="bg-gradient-cosmic text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

          </div> : <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src={selectedKnight.image_url} alt={selectedKnight.name} className="w-[110px] h-[110px] rounded-full border-2 border-accent/20" />
                <h1 className="text-[3.6rem] font-bold text-foreground">
                  {selectedKnight.name}
                </h1>
              </div>
              <button onClick={() => setSelectedKnight(null)} className="text-accent hover:text-accent/80 transition-colors">
                Voltar
              </button>
            </div>
          </div>}

        {!selectedKnight ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredKnights.map(knight => <div key={knight.id} className="p-4 cursor-pointer hover:bg-muted/65 transition-colors rounded-lg" onClick={() => handleKnightClick(knight)}>
                <div className="flex items-center gap-3">
                  <img src={knight.image_url} alt={knight.name} className="w-20 h-20 rounded-full border-2 border-accent/20" />
                  <h3 className="text-foreground/80 hover:text-foreground transition-colors">{knight.name}</h3>
                </div>
              </div>)}
          </div> : <div className="space-y-6">
            <Card className="bg-card border-none shadow-none">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Vitórias - lado esquerdo */}
                  <div>
                    <h3 className="text-lg font-semibold text-accent mb-3 flex items-center justify-center gap-2 ">
                      <div className="flex flex-col items-center">
                        <div>🏆</div>
                        <div>Vitórias ({knightHistory?.victories?.length || 0})</div>
                      </div>
                    </h3>
                    <div className="space-y-3">
                      {knightHistory?.victories?.length ? knightHistory.victories.map((battle, index) => <Card key={index} className="bg-accent/5 border-none shadow-none">
                            <CardContent className="px-4 py-7 justify-center text-center ">
                              <div className="flex items-center justify-between gap-2">
                                {/* Time Aliado */}
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                     {battle.winner_team.map((ally, i) => {
                              const knight = knights.find(k => k.id === ally);
                              const isCurrentKnight = knight?.id === selectedKnight?.id;
                              return knight ? <div key={i} onClick={() => handleKnightClick(knight)} className="flex flex-col items-center gap-1 cursor-pointer m-auto">
                                           <img src={knight.image_url} alt={knight.name} className={`w-8 h-8 rounded-full border ${isCurrentKnight ? 'border-white scale-105' : 'border-accent/20'} transition-transform`} />
                                           <span className={`text-xs transition-colors cursor-pointer ${isCurrentKnight ? 'text-white' : 'text-foreground hover:text-accent'}`} onClick={() => handleKnightClick(knight)}>
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

                                {/* Time Inimigo */}
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                     {battle.loser_team.map((enemy, i) => {
                              const knight = knights.find(k => k.id === enemy);
                              const isCurrentKnight = knight?.id === selectedKnight?.id;
                              return knight ? <div key={i} onClick={() => handleKnightClick(knight)} className="flex flex-col items-center gap-1 cursor-pointer m-auto">
                                           <img src={knight.image_url} alt={knight.name} className={`w-8 h-8 rounded-full border ${isCurrentKnight ? 'border-white scale-105' : 'border-purple-400/20'} transition-transform`} />
                                           <span className={`text-xs transition-colors cursor-pointer ${isCurrentKnight ? 'text-white' : 'text-foreground hover:text-purple-400'}`} onClick={() => handleKnightClick(knight)}>
                                             {knight.name}
                                           </span>
                                         </div> : null;
                            })}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>) : <p className="text-center text-muted-foreground py-4">
                          Nenhuma vitória registrada
                        </p>}
                    </div>
                  </div>

                  {/* Derrotas - lado direito */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-3 flex items-center justify-center gap-2">
                      <div className="flex flex-col items-center">
                        <div>💀</div>
                        <div>Derrotas ({knightHistory?.defeats?.length || 0})</div>
                      </div>
                    </h3>
                    <div className="space-y-3">
                      {knightHistory?.defeats?.length ? knightHistory.defeats.map((battle, index) => <Card key={index} className="bg-primary/5 border-none shadow-none">
                            <CardContent className="px-4 py-7 justify-center text-center ">
                              <div className="flex items-center justify-between gap-4">
                                {/* Time Aliado */}
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                     {battle.loser_team.map((ally, i) => {
                              const knight = knights.find(k => k.id === ally);
                              const isCurrentKnight = knight?.id === selectedKnight?.id;
                              return knight ? <div key={i} onClick={() => handleKnightClick(knight)} className="flex flex-col items-center gap-1 cursor-pointer m-auto">
                                           <img src={knight.image_url} alt={knight.name} className={`w-8 h-8 rounded-full border ${isCurrentKnight ? 'border-white scale-105' : 'border-primary/20'} transition-transform`} />
                                           <span className={`text-xs transition-colors cursor-pointer ${isCurrentKnight ? 'text-white' : 'text-foreground hover:text-primary'}`} onClick={() => handleKnightClick(knight)}>
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

                                {/* Time Inimigo */}
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                     {battle.winner_team.map((enemy, i) => {
                              const knight = knights.find(k => k.id === enemy);
                              const isCurrentKnight = knight?.id === selectedKnight?.id;
                              return knight ? <div key={i} onClick={() => handleKnightClick(knight)} className="flex flex-col items-center gap-1 cursor-pointer m-auto">
                                           <img src={knight.image_url} alt={knight.name} className={`w-8 h-8 rounded-full border ${isCurrentKnight ? 'border-white scale-105' : 'border-accent/20'} transition-transform`} />
                                           <span className={`text-xs transition-colors cursor-pointer ${isCurrentKnight ? 'text-white' : 'text-foreground hover:text-accent'}`} onClick={() => handleKnightClick(knight)}>
                                             {knight.name}
                                           </span>
                                         </div> : null;
                            })}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>) : <p className="text-center text-muted-foreground py-4">
                          Nenhuma derrota registrada
                        </p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>
      
      <CreateKnightModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onKnightCreated={handleKnightCreated}
      />
      
      <Footer />
    </div>;
};
export default Knights;