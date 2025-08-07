import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Users } from "lucide-react";
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

interface Team {
  knights: string[];
  stigma: string;
}

const CreateBattle = () => {
  const [winnerTeam, setWinnerTeam] = useState<Team>({ knights: [], stigma: '' });
  const [loserTeam, setLoserTeam] = useState<Team>({ knights: [], stigma: '' });
  const [battleType, setBattleType] = useState("Padrão");
  const [isMeta, setIsMeta] = useState(false);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKnights();
    fetchStigmas();
  }, []);

  const fetchKnights = async () => {
    try {
      const { data, error } = await supabase
        .from('knights')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cavaleiros",
        variant: "destructive",
      });
    }
  };

  const fetchStigmas = async () => {
    try {
      const { data, error } = await supabase
        .from('stigmas')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setStigmas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estigmas",
        variant: "destructive",
      });
    }
  };

  const handleKnightToggle = (knightId: string, team: 'winner' | 'loser') => {
    if (team === 'winner') {
      setWinnerTeam(prev => ({
        ...prev,
        knights: prev.knights.includes(knightId)
          ? prev.knights.filter(id => id !== knightId)
          : [...prev.knights, knightId]
      }));
    } else {
      setLoserTeam(prev => ({
        ...prev,
        knights: prev.knights.includes(knightId)
          ? prev.knights.filter(id => id !== knightId)
          : [...prev.knights, knightId]
      }));
    }
  };

  const isKnightSelected = (knightId: string) => {
    return winnerTeam.knights.includes(knightId) || loserTeam.knights.includes(knightId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (winnerTeam.knights.length === 0 || loserTeam.knights.length === 0) {
      toast({
        title: "Erro",
        description: "Ambos os times devem ter pelo menos um cavaleiro",
        variant: "destructive",
      });
      return;
    }

    if (!winnerTeam.stigma || !loserTeam.stigma) {
      toast({
        title: "Erro",
        description: "Ambos os times devem ter um estigma selecionado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('battles')
        .insert({
          winner_team: winnerTeam.knights,
          loser_team: loserTeam.knights,
          winner_team_stigma: winnerTeam.stigma,
          loser_team_stigma: loserTeam.stigma,
          tipo: battleType,
          meta: isMeta,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Batalha criada com sucesso",
      });

      // Reset form
      setWinnerTeam({ knights: [], stigma: '' });
      setLoserTeam({ knights: [], stigma: '' });
      setBattleType("Padrão");
      setIsMeta(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a batalha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStigmaName = (stigmaId: string) => {
    const stigma = stigmas.find(s => s.id === stigmaId);
    return stigma ? stigma.nome : '';
  };

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Nova Batalha
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Battle Settings */}
          <Card className="bg-card/60 backdrop-blur-sm border-none">
            <CardHeader>
              <CardTitle className="text-foreground">Configurações da Batalha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="battleType" className="text-foreground">Categoria</Label>
                  <Select value={battleType} onValueChange={setBattleType}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Padrão">Padrão</SelectItem>
                      <SelectItem value="Athena">Athena</SelectItem>
                      <SelectItem value="Econômico">Econômico</SelectItem>
                      <SelectItem value="Hades">Hades</SelectItem>
                      <SelectItem value="Lua">Lua</SelectItem>
                      <SelectItem value="Poseidon">Poseidon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox 
                    id="meta" 
                    checked={isMeta}
                    onCheckedChange={setIsMeta}
                    className="border-border"
                  />
                  <Label htmlFor="meta" className="text-foreground">Batalha Meta</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams Selection */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Winner Team */}
            <Card className="bg-green-500/10 backdrop-blur-sm border-none">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Time Vencedor
                  {winnerTeam.stigma && (
                    <span className="text-sm font-normal text-muted-foreground">
                      - {getSelectedStigmaName(winnerTeam.stigma)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Select value={winnerTeam.stigma} onValueChange={(value) => setWinnerTeam(prev => ({ ...prev, stigma: value }))}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Qual o estigma desse time?" />
                    </SelectTrigger>
                    <SelectContent>
                      {stigmas.map((stigma) => (
                        <SelectItem key={stigma.id} value={stigma.id}>
                          {stigma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione cavaleiros para o time vencedor ({winnerTeam.knights.length} selecionados)
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {knights.map((knight) => (
                      <div
                        key={knight.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          winnerTeam.knights.includes(knight.id)
                            ? 'bg-accent/20'
                            : isKnightSelected(knight.id)
                              ? 'bg-muted/50 opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/30'
                        }`}
                        onClick={() => !isKnightSelected(knight.id) || winnerTeam.knights.includes(knight.id) ? handleKnightToggle(knight.id, 'winner') : null}
                      >
                        <img
                          src={knight.image_url}
                          alt={knight.name}
                          className="w-8 h-8 rounded-full border border-accent/20"
                        />
                        <span className="text-foreground">{knight.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loser Team */}
            <Card className="bg-red-500/10 backdrop-blur-sm border-none">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Time Perdedor
                  {loserTeam.stigma && (
                    <span className="text-sm font-normal text-muted-foreground">
                      - {getSelectedStigmaName(loserTeam.stigma)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Select value={loserTeam.stigma} onValueChange={(value) => setLoserTeam(prev => ({ ...prev, stigma: value }))}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Qual o estigma desse time?" />
                    </SelectTrigger>
                    <SelectContent>
                      {stigmas.map((stigma) => (
                        <SelectItem key={stigma.id} value={stigma.id}>
                          {stigma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione cavaleiros para o time perdedor ({loserTeam.knights.length} selecionados)
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {knights.map((knight) => (
                      <div
                        key={knight.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          loserTeam.knights.includes(knight.id)
                            ? 'bg-primary/20'
                            : isKnightSelected(knight.id)
                              ? 'bg-muted/50 opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/30'
                        }`}
                        onClick={() => !isKnightSelected(knight.id) || loserTeam.knights.includes(knight.id) ? handleKnightToggle(knight.id, 'loser') : null}
                      >
                        <img
                          src={knight.image_url}
                          alt={knight.name}
                          className="w-8 h-8 rounded-full border border-primary/20"
                        />
                        <span className="text-foreground">{knight.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Knights */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Cavaleiros Disponíveis
            </h3>
            
            <Card className="bg-card/60 backdrop-blur-sm border-none">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {knights.filter(knight => !isKnightSelected(knight.id)).map((knight) => (
                    <div
                      key={knight.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <img
                        src={knight.image_url}
                        alt={knight.name}
                        className="w-12 h-12 rounded-full border border-accent/20"
                      />
                      <span className="text-foreground">{knight.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to="/battles">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-cosmic text-white hover:opacity-90"
            >
              {loading ? "Criando..." : "Criar Batalha"}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBattle;
