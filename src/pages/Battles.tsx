import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import BattleCard from "@/components/BattleCard";
import SEOHead from "@/components/SEOHead";
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
  created_by: string;
  meta: boolean | null;
  tipo: string;
}
interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
}
const ITEMS_PER_PAGE = 12;
const Battles = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchP1, setSearchP1] = useState("");
  const [searchP2, setSearchP2] = useState("");
  const [searchP3, setSearchP3] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBattles, setTotalBattles] = useState(0);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchBattles();
    fetchKnights();
    fetchStigmas();
    fetchProfiles();
  }, [searchP1, searchP2, searchP3, typeFilter, currentPage]);
  const fetchBattles = async () => {
    try {
      let query = supabase.from('battles').select('*', {
        count: 'exact'
      });
      if (typeFilter !== 'all') {
        query = query.eq('tipo', typeFilter);
      }
      const {
        data,
        error,
        count
      } = await query.order('created_at', {
        ascending: false
      }).range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      if (error) throw error;
      setBattles((data || []).map(battle => ({
        ...battle,
        meta: battle.meta || false
      })));
      setTotalBattles(count || 0);
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
      const {
        data,
        error
      } = await supabase.from('knights').select('*');
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cavaleiros:', error);
    }
  };
  const fetchStigmas = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('stigmas').select('*');
      if (error) throw error;
      setStigmas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estigmas:', error);
    }
  };
  const fetchProfiles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('id, user_id, full_name');
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
  const filteredBattles = battles.filter(battle => {
    const matchesP1 = !searchP1 || 
      getKnightById(battle.winner_team[0])?.name.toLowerCase().includes(searchP1.toLowerCase()) ||
      getKnightById(battle.loser_team[0])?.name.toLowerCase().includes(searchP1.toLowerCase());
    
    const matchesP2 = !searchP2 || 
      getKnightById(battle.winner_team[1])?.name.toLowerCase().includes(searchP2.toLowerCase()) ||
      getKnightById(battle.loser_team[1])?.name.toLowerCase().includes(searchP2.toLowerCase());
    
    const matchesP3 = !searchP3 || 
      getKnightById(battle.winner_team[2])?.name.toLowerCase().includes(searchP3.toLowerCase()) ||
      getKnightById(battle.loser_team[2])?.name.toLowerCase().includes(searchP3.toLowerCase());
    
    return matchesP1 && matchesP2 && matchesP3;
  });
  const totalPages = Math.ceil(filteredBattles.length / ITEMS_PER_PAGE);
  const paginatedBattles = filteredBattles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  if (loading) {
    return <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>;
  }
  return <div className="min-h-screen">
      <SEOHead title="Oblivium • Histórico de Batalhas" description={`Existem ${totalBattles} batalhas cadastradas no total, utilizando ${knights.length} cavaleiros.`} />
      <Header />
      <div className="max-w-6xl mx-auto p-3 md:p-6 ">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Batalhas</h1>
          <p className="text-muted-foreground text-center">
            Histórico completo das batalhas registradas
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col-reverse sm:flex-row gap-4 items-end justify-between flex-wrap-reverse w-full ">
          <div className="flex flex-col gap-4 flex-1 w-full">
            <div className="flex gap-2 w-full">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">P1</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    value={searchP1} 
                    onChange={e => {
                      setSearchP1(e.target.value);
                      setCurrentPage(1);
                    }} 
                    placeholder="Cavaleiro P1"
                    className="pl-10 bg-card border-border" 
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">P2</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    value={searchP2} 
                    onChange={e => {
                      setSearchP2(e.target.value);
                      setCurrentPage(1);
                    }} 
                    placeholder="Cavaleiro P2"
                    className="pl-10 bg-card border-border" 
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">P3</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    value={searchP3} 
                    onChange={e => {
                      setSearchP3(e.target.value);
                      setCurrentPage(1);
                    }} 
                    placeholder="Cavaleiro P3"
                    className="pl-10 bg-card border-border" 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={value => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px] bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Athena">Athena</SelectItem>
                  <SelectItem value="Econômico">Econômico</SelectItem>
                  <SelectItem value="Hades">Hades</SelectItem>
                  <SelectItem value="Lua">Lua</SelectItem>
                  <SelectItem value="Padrão">Padrão</SelectItem>
                  <SelectItem value="Poseidon">Poseidon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button asChild className="bg-gradient-cosmic text-white hover:opacity-90 md:ml-auto">
            <Link to="/create-battle">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Link>
          </Button>
        </div>

        {/* Lista de Batalhas */}
        {filteredBattles.length > 0 ? <>
            <div className="grid gap-6 md:grid-cols-2">
              {paginatedBattles.map(battle => <BattleCard key={battle.id} battle={battle} knights={knights} stigmas={stigmas} profiles={profiles} onDelete={fetchBattles} />)}
            </div>

            {/* Paginação */}
            {totalPages > 1 && <div className="mt-8 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="bg-card border-border">
                  Anterior
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({
              length: totalPages
            }, (_, i) => i + 1).filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1).map((page, index, array) => <div key={page} className="flex items-center gap-2">
                        {index > 0 && array[index - 1] !== page - 1 && <span className="text-muted-foreground">...</span>}
                        <Button variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)} className={currentPage === page ? "bg-gradient-cosmic text-white" : "bg-card border-border"}>
                          {page}
                        </Button>
                      </div>)}
                </div>
                
                <Button variant="outline" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="bg-card border-border">
                  Próxima
                </Button>
              </div>}
          </> : <div className="text-center py-12">
            <p className="text-muted-foreground text-xl mb-4">Nenhuma batalha cadastrada ainda.</p>
            <Button asChild className="bg-gradient-cosmic text-white hover:opacity-90">
              <Link to="/create-battle">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Batalha
              </Link>
            </Button>
          </div>}
      </div>
      <Footer />
    </div>;
};
export default Battles;