import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Sword, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseKnightUrl } from "@/lib/utils";
import ShareButtons from "@/components/ShareButtons";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
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

const KnightDetail = () => {
  const { knightUrl } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [knight, setKnight] = useState<Knight | null>(null);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (knightUrl) {
      const parsed = parseKnightUrl(knightUrl);
      if (parsed) {
        fetchKnightData(parsed.idPrefix);
      } else {
        // If parsing fails, try direct match first 3 chars
        const idPrefix = knightUrl.substring(0, 3);
        fetchKnightData(idPrefix);
      }
    }
  }, [knightUrl]);

  const fetchKnightData = async (idPrefix: string) => {
    try {
      setLoading(true);
      await Promise.all([
        fetchKnight(idPrefix),
        fetchAllKnights(),
        fetchBattles(),
        fetchStigmas(),
        fetchProfiles()
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cavaleiro",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchKnight = async (idPrefix: string) => {
    try {
      const { data, error } = await supabase
        .from('knights')
        .select('*')
        .like('id', `${idPrefix}%`);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setKnight(data[0]); // Take the first match
      } else {
        console.log('Knight not found with prefix:', idPrefix);
        navigate('/knights');
      }
    } catch (error: any) {
      console.error("Erro ao carregar cavaleiro:", error);
      navigate('/knights');
    }
  };

  const fetchAllKnights = async () => {
    try {
      const { data, error } = await supabase
        .from('knights')
        .select('*');
      
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar cavaleiros:", error);
    }
  };

  const fetchBattles = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*');
      
      if (error) throw error;
      setBattles(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar batalhas:", error);
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
        .select('id, user_id, full_name');
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!knight) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Cavaleiro não encontrado</h1>
          <Link to="/knights">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Cavaleiros
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const knightBattles = battles.filter(battle => 
    battle.winner_team.includes(knight.id) || battle.loser_team.includes(knight.id)
  );
  const victories = battles.filter(battle => battle.winner_team.includes(knight.id));
  const defeats = battles.filter(battle => battle.loser_team.includes(knight.id));
  const totalAppearances = knightBattles.length;

  return (
    <div className="min-h-screen">
      <SEOHead 
        title={`Oblivium • Histórico de ${knight.name}`} 
        description={`${knight.name} aparece em ${totalAppearances} times, contando com ${victories.length} vitórias e ${defeats.length} derrotas.`} 
      />
      <Header />
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <Breadcrumb knightName={knight.name} />
        <div className="mb-6 flex justify-end">
          <Link to="/knights">
            <Button className="bg-transparent text-amber-200 text-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <img 
            src={knight.image_url} 
            alt={knight.name} 
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-accent" 
          />
          <h1 className="text-4xl text-foreground mb-2 font-semibold">{knight.name}</h1>
          <p className="text-muted-foreground -mt-4 text-xl">{totalAppearances} times</p>
          <ShareButtons url={window.location.href} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-none shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-0">
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
          
          {knightBattles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {knightBattles.map(battle => (
                <BattleCard 
                  key={battle.id} 
                  battle={battle} 
                  knights={knights} 
                  stigmas={stigmas} 
                  profiles={profiles} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-base">
                Este cavaleiro ainda não participou de batalhas
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default KnightDetail;