import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
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
  const [searchTerm, setSearchTerm] = useState("");
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
  }, [searchTerm, typeFilter, currentPage]);
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
      } = await supabase.from('profiles').select('*');
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
    const matchesSearch = battle.winner_team.some(knightId => {
      const knight = getKnightById(knightId);
      return knight?.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || battle.loser_team.some(knightId => {
      const knight = getKnightById(knightId);
      return knight?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return matchesSearch;
  });
  const totalPages = Math.ceil(totalBattles / ITEMS_PER_PAGE);
  if (loading) {
    return <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando batalhas...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-nebula">
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
        <div className="mb-6 flex flex-col-reverse sm:flex-row gap-4 items-center justify-between flex-wrap-reverse w-full ">
          <div className="flex gap-4 flex-1 w-full  ">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar por cavaleiro..." value={searchTerm} onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }} className="pl-3 lg:pl-10 bg-card border-border  " />
            </div>
            
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

          <Button asChild className="bg-gradient-cosmic text-white hover:opacity-90">
            <Link to="/create-battle">
              <Plus className="w-4 h-4 mr-2" />
              Nova Batalha
            </Link>
          </Button>
        </div>

        {/* Lista de Batalhas */}
        {filteredBattles.length > 0 ? <>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredBattles.map(battle => <BattleCard key={battle.id} battle={battle} knights={knights} stigmas={stigmas} profiles={profiles} onDelete={fetchBattles} />)}
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