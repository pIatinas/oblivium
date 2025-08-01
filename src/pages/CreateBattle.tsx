import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";

interface Knight {
  id: string;
  name: string;
  image_url: string;
}

const CreateBattle = () => {
  const [knights, setKnights] = useState<Knight[]>([]);
  const [winnerTeam, setWinnerTeam] = useState<Knight[]>([]);
  const [loserTeam, setLoserTeam] = useState<Knight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMetaAttack, setIsMetaAttack] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKnights();
  }, []);

  const fetchKnights = async () => {
    try {
      const { data, error } = await supabase
        .from('knights')
        .select('*')
        .order('name');
      
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

  const addToTeam = (knight: Knight, team: 'winner' | 'loser') => {
    if (team === 'winner') {
      if (winnerTeam.length >= 3) {
        toast({
          title: "Limite atingido",
          description: "Máximo de 3 cavaleiros por time",
          variant: "destructive"
        });
        return;
      }
      setWinnerTeam([...winnerTeam, knight]);
    } else {
      if (loserTeam.length >= 3) {
        toast({
          title: "Limite atingido",
          description: "Máximo de 3 cavaleiros por time",
          variant: "destructive"
        });
        return;
      }
      setLoserTeam([...loserTeam, knight]);
    }
  };

  const removeFromTeam = (knightId: string, team: 'winner' | 'loser') => {
    if (team === 'winner') {
      setWinnerTeam(winnerTeam.filter(k => k.id !== knightId));
    } else {
      setLoserTeam(loserTeam.filter(k => k.id !== knightId));
    }
  };

  const getKnightTeamCount = (knightId: string) => {
    const winnerCount = winnerTeam.filter(k => k.id === knightId).length;
    const loserCount = loserTeam.filter(k => k.id === knightId).length;
    return winnerCount + loserCount;
  };

  const filteredKnights = knights.filter(knight =>
    knight.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (winnerTeam.length === 0 || loserTeam.length === 0) {
      toast({
        title: "Erro",
        description: "Ambos os times devem ter pelo menos um cavaleiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('battles')
        .insert([
          {
            winner_team: winnerTeam.map(k => k.id),
            loser_team: loserTeam.map(k => k.id),
            meta: isMetaAttack,
            created_by: (await supabase.auth.getUser()).data.user?.id!
          }
        ]);

      if (error) throw error;

      toast({
        title: "Batalha Registrada!",
        description: "A batalha foi cadastrada com sucesso",
      });

      navigate('/battles');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a batalha",
        variant: "destructive"
      });
    }
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
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb />
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Cadastrar
          </h1>
          <p className="text-muted-foreground text-center">
            Selecione os cavaleiros para compor os times vencedor e perdedor
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vencedor */}
          <Card className="bg-card border-accent border-[3px]">
            <CardHeader>
              <CardTitle className="text-accent text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div>Vencedor</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 min-h-[200px]">
                {winnerTeam.map((knight) => (
                  <div
                    key={knight.id}
                    className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={knight.image_url}
                        alt={knight.name}
                        className="w-10 h-10 rounded-full border border-accent/20"
                      />
                      <span className="text-foreground font-medium">
                        {knight.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromTeam(knight.id, 'winner')}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {winnerTeam.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Selecione cavaleiros para o time vencedor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Perdedor */}
          <Card className="bg-card border-purple-400 border-[3px]">
            <CardHeader>
              <CardTitle className="text-purple-400 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">💀</div>
                  <div>Perdedor</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 min-h-[200px]">
                {loserTeam.map((knight) => (
                  <div
                    key={knight.id}
                    className="flex items-center justify-between p-3 bg-purple-400/5 rounded-lg border border-purple-400/20"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={knight.image_url}
                        alt={knight.name}
                        className="w-10 h-10 rounded-full border border-purple-400/20"
                      />
                      <span className="text-foreground font-medium">
                        {knight.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromTeam(knight.id, 'loser')}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {loserTeam.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Selecione cavaleiros para o time perdedor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta de Ataque Checkbox */}
        <div className="mt-8 mb-6 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="meta-attack" 
              checked={isMetaAttack}
              onCheckedChange={(checked) => setIsMetaAttack(checked as boolean)}
            />
            <Label htmlFor="meta-attack" className="text-foreground cursor-pointer">
              Meta de Ataque
            </Label>
          </div>
        </div>

        {/* Buscar Cavaleiros e Botão de Cadastro */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSubmit}
                className="bg-gradient-cosmic text-white hover:opacity-90 px-8 py-3 text-lg"
                disabled={winnerTeam.length === 0 || loserTeam.length === 0}
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Cavaleiros Disponíveis */}
        <Card className="bg-card border-none">
          <CardHeader>
            <CardTitle className="text-foreground text-center">
              Cavaleiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredKnights.map((knight) => (
                <div
                  key={knight.id}
                  className="p-3 rounded-lg border transition-all duration-300 bg-background border-border hover:border-accent/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={knight.image_url}
                        alt={knight.name}
                        className="w-10 h-10 rounded-full border border-border"
                      />
                      <span className="text-foreground font-medium">
                        {knight.name}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToTeam(knight, 'winner')}
                        className="text-xs bg-accent/10 border-accent/20 text-accent hover:bg-accent/20 px-2 py-1"
                        disabled={winnerTeam.length >= 3}
                      >
                        Vencedor
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToTeam(knight, 'loser')}
                        className="text-xs bg-purple-400/10 border-purple-400/20 text-purple-400 hover:bg-purple-400/20 px-2 py-1"
                        disabled={loserTeam.length >= 3}
                      >
                        Perdedor
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredKnights.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cavaleiro encontrado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBattle;