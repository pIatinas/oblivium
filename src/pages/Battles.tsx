import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const Battles = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [filteredBattles, setFilteredBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [metaFilter, setMetaFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBattles();
  }, [battles, searchTerm, typeFilter, metaFilter]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchBattles(),
        fetchKnights(),
        fetchStigmas(),
        fetchProfiles()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBattles = async () => {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar batalhas:', error);
      return;
    }
    
    setBattles(data || []);
  };

  const fetchKnights = async () => {
    const { data } = await supabase.from('knights').select('*');
    if (data) setKnights(data);
  };

  const fetchStigmas = async () => {
    const { data } = await supabase.from('stigmas').select('*');
    if (data) setStigmas(data);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data);
  };

  const filterBattles = () => {
    let filtered = battles;

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(battle => battle.tipo === typeFilter);
    }

    // Filter by meta
    if (metaFilter !== "all") {
      const isMeta = metaFilter === "true";
      filtered = filtered.filter(battle => battle.meta === isMeta);
    }

    // Filter by search term (knight names)
    if (searchTerm) {
      filtered = filtered.filter(battle => {
        const allKnightIds = [...battle.winner_team, ...battle.loser_team];
        return allKnightIds.some(knightId => {
          const knight = knights.find(k => k.id === knightId);
          return knight?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    setFilteredBattles(filtered);
  };

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
      <div className="max-w-6xl mx-auto p-3 lg:p-6">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Batalhas</h1>
          <p className="text-muted-foreground text-center">
            Histórico completo de todas as batalhas registradas
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por cavaleiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Athena">Athena</SelectItem>
              <SelectItem value="Econômico">Econômico</SelectItem>
              <SelectItem value="Hades">Hades</SelectItem>
              <SelectItem value="Lua">Lua</SelectItem>
              <SelectItem value="Padrão">Padrão</SelectItem>
              <SelectItem value="Poseidon">Poseidon</SelectItem>
            </SelectContent>
          </Select>

          <Select value={metaFilter} onValueChange={setMetaFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="true">Com Meta</SelectItem>
              <SelectItem value="false">Sem Meta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredBattles.length} batalha{filteredBattles.length !== 1 ? 's' : ''} encontrada{filteredBattles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Battles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBattles.map((battle) => (
            <BattleCard 
              key={battle.id} 
              battle={battle} 
              knights={knights} 
              stigmas={stigmas} 
              profiles={profiles}
              onDelete={fetchBattles}
            />
          ))}
        </div>

        {filteredBattles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma batalha encontrada com os filtros selecionados.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Battles;
