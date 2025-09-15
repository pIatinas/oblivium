import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, ArrowLeft, Trophy, Sword, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import { createKnightUrl, parseKnightUrl } from "@/lib/utils";
import ShareButtons from "@/components/ShareButtons";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
import CreateKnightForm from "@/components/CreateKnightForm";
import BattleCard from "@/components/BattleCard";
interface Knight {
  id: string;
  name: string;
  image_url: string;
  slug: string | null;
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
const Knights = () => {
  const [knights, setKnights] = useState<Knight[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [selectedKnight, setSelectedKnight] = useState<Knight | null>(null);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();
  const {
    knightUrl
  } = useParams();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const knightParam = searchParams.get("knight");
    if (knightParam) {
      const initialSelectedKnight = knights.find(knight => knight.id === knightParam);
      setSelectedKnight(initialSelectedKnight || null);
    } else if (knightUrl) {
      // Handle new URL format /knight/123-name
      const parsed = parseKnightUrl(knightUrl);
      if (parsed) {
        const knight = knights.find(k => k.id.startsWith(parsed.idPrefix));
        setSelectedKnight(knight || null);
      }
    }
  }, [knights, searchParams, knightUrl]);
  useEffect(() => {
    fetchData();
  }, [sortBy, searchTerm]);
  useEffect(() => {
    // Only trigger re-render when searchTerm changes, not when knights change
    const timeoutId = setTimeout(() => {
      if (document.activeElement === searchInputRef.current) {
        const cursorPosition = searchInputRef.current?.selectionStart || 0;
        requestAnimationFrame(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
          }
        });
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchKnights(), fetchBattles(), fetchStigmas(), fetchProfiles()]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchKnights = async () => {
    try {
      let query = supabase.from('knights').select('*');
      if (sortBy === 'name') {
        query = query.order('name', {
          ascending: true
        });
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar cavaleiros:", error);
    }
  };
  const fetchBattles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('battles').select('*');
      if (error) throw error;
      setBattles(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar batalhas:", error);
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
  const getKnightAppearances = (knightId: string) => {
    return battles.filter(battle => battle.winner_team.includes(knightId) || battle.loser_team.includes(knightId)).length;
  };
  const filteredKnights = knights.filter(knight => knight.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
    if (sortBy === "most_used") {
      return getKnightAppearances(b.id) - getKnightAppearances(a.id);
    } else if (sortBy === "least_used") {
      return getKnightAppearances(a.id) - getKnightAppearances(b.id);
    }
    return 0;
  });
  if (loading) {
    return <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>;
  }
  if (selectedKnight) {
    const knightBattles = battles.filter(battle => battle.winner_team.includes(selectedKnight.id) || battle.loser_team.includes(selectedKnight.id));
    const victories = battles.filter(battle => battle.winner_team.includes(selectedKnight.id));
    const defeats = battles.filter(battle => battle.loser_team.includes(selectedKnight.id));
    const totalAppearances = getKnightAppearances(selectedKnight.id);
    return <div className="min-h-screen ">
        <SEOHead title={`Oblivium • Histórico de ${selectedKnight.name}`} description={`${selectedKnight.name} aparece em ${totalAppearances} times, contando com ${victories.length} vitórias e ${defeats.length} derrotas.`} />
        <Header />
        <div className="max-w-6xl mx-auto p-3 md:p-6">
          <Breadcrumb knightName={selectedKnight.name} />
          <div className="mb-6 flex justify-end">
            <Button onClick={() => {
            setSelectedKnight(null);
            navigate('/knights');
          }} className="bg-transparent text-amber-200 text-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="text-center mb-8">
            <img src={selectedKnight.image_url} alt={selectedKnight.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-accent" />
            <h1 className="text-4xl text-foreground mb-2 font-semibold">{selectedKnight.name}</h1>
            <p className="text-muted-foreground -mt-4 text-xl">{totalAppearances} times</p>
            <ShareButtons url={`${window.location.origin}/knight/${createKnightUrl(selectedKnight.id, selectedKnight.name)}`} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border-none shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-0 ">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-accent text-2xl -mb-1 mt-4 lg:text-3xl">{victories.length}</CardTitle>
                <CardDescription className="-mt-4 text-xl">Vitórias</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-none shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mb-0">
                  <Sword className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-purple-600 -mb-1 mt-2 lg:text-3xl">{defeats.length}</CardTitle>
                <CardDescription className="-mt-4 text-xl">Derrotas</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl text-foreground mb-6 font-medium">Histórico de Batalhas</h2>
            
            {knightBattles.length > 0 ? <div className="grid md:grid-cols-2 gap-6">
                {knightBattles.map(battle => <BattleCard key={battle.id} battle={battle} knights={knights} stigmas={stigmas} profiles={profiles} />)}
              </div> : <div className="text-center py-8">
                <p className="text-muted-foreground text-base">
                  Este cavaleiro ainda não participou de batalhas
                </p>
              </div>}
          </div>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen">
      <SEOHead title="Oblivium • Cavaleiros Disponíveis" description={`Existem ${knights.length} cavaleiros disponíveis, utilizados em ${battles.length} batalhas diferentes.`} />
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Cavaleiros</h1>
          <p className="text-muted-foreground text-center">
            Explore todos os cavaleiros cadastrados
          </p>
        </div>

        <div className="mb-6 flex flex-col-reverse sm:flex-row gap-4 items-center justify-between flex-wrap-reverse w-full ">
          <div className="flex gap-4 flex-1 w-full ">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                ref={searchInputRef} 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar cavaleiro..."
                className="pl-10 bg-card border-border" 
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="most_used">Mais Usado</SelectItem>
                <SelectItem value="least_used">Menos Usado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-cosmic text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cavaleiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cavaleiro</DialogTitle>
              </DialogHeader>
              <CreateKnightForm onKnightCreated={() => {
              fetchKnights();
              setIsDialogOpen(false);
            }} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {filteredKnights.length > 0 ? <div className="grid gap-1 lg:gap-6 grid-cols-3 md:grid-cols-4  lg:grid-cols-5 xl:grid-cols-6">
            {filteredKnights.map(knight => {
          const appearances = getKnightAppearances(knight.id);
          const knightUrl = createKnightUrl(knight.id, knight.name);
          return <Card key={knight.id} onClick={() => {
            setSelectedKnight(knight);
            navigate(`/knight/${createKnightUrl(knight.id, knight.name)}`);
          }} className="bg-card hover:bg-card/80 transition-all duration-300 cursor-pointer border-none">
                  <CardContent className="px-3 py-2 text-center bg-transparent ">
                    <img src={knight.image_url} alt={knight.name} className="w-20 h-20 rounded-full mx-auto mb-1 border border-accent/20" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{knight.name}</h3>
                    <p className="text-sm text-muted-foreground -mt-4 ">{appearances} times</p>
                  </CardContent>
                </Card>;
        })}
          </div> : <div className="text-center py-12">
            <p className="text-muted-foreground text-xl mb-4">
              Nenhum cavaleiro encontrado
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-cosmic text-white hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Cavaleiro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Cavaleiro</DialogTitle>
                </DialogHeader>
                <CreateKnightForm onKnightCreated={fetchKnights} />
              </DialogContent>
            </Dialog>
          </div>}
      </div>
      <Footer />
    </div>;
};
export default Knights;