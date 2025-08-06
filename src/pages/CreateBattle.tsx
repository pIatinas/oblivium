import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Stigma {
  id: string;
  nome: string;
  imagem: string;
}

const CreateBattle = () => {
  const [knights, setKnights] = useState<Knight[]>([]);
  const [stigmas, setStigmas] = useState<Stigma[]>([]);
  const [winnerTeam, setWinnerTeam] = useState<Knight[]>([]);
  const [loserTeam, setLoserTeam] = useState<Knight[]>([]);
  const [winnerStigma, setWinnerStigma] = useState("");
  const [loserStigma, setLoserStigma] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMetaAttack, setIsMetaAttack] = useState(false);
  const [battleType, setBattleType] = useState('Padrão');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKnights();
    fetchStigmas();
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

  const fetchStigmas = async () => {
    try {
      const { data, error } = await supabase
        .from('stigmas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setStigmas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estigmas",
        variant: "destructive"
      });
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

  const isKnightInBothTeams = (knightId: string) => {
    return winnerTeam.some(k => k.id === knightId) && loserTeam.some(k => k.id === knightId);
  };

  const isKnightInTeam = (knightId: string, team: 'winner' | 'loser') => {
    if (team === 'winner') {
      return winnerTeam.some(k => k.id === knightId);
    } else {
      return loserTeam.some(k => k.id === knightId);
    }
  };

  const filteredKnights = knights.filter(knight => 
    knight.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (winnerTeam.length !== 3 || loserTeam.length !== 3) {
      toast({
        title: "Erro",
        description: "Ambos os times devem ter exatamente 3 cavaleiros",
        variant: "destructive"
      });
      return;
    }

    if (!winnerStigma || !loserStigma) {
      toast({
        title: "Erro",
        description: "Ambos os times devem ter um estigma selecionado",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('battles')
        .insert([{
          winner_team: winnerTeam.map(k => k.id),
          loser_team: loserTeam.map(k => k.id),
          winner_team_stigma: winnerStigma,
          loser_team_stigma: loserStigma,
          meta: isMetaAttack,
          tipo: battleType,
          created_by: (await supabase.auth.getUser()).data.user?.id!
        }]);

      if (error) throw error;

      toast({
        title: "Batalha Registrada!",
        description: "A batalha foi cadastrada com sucesso"
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

  const getStigmaById = (stigmaId: string) => {
    return stigmas.find(s => s.id === stigmaId);
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
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Cadastro de Batalha</h1>
          <p className="text-muted-foreground text-center">
            Selecione os cavaleiros para compor os times vencedor e perdedor
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Time Vencedor */}
          <Card className="bg-card border-accent border-[3px] relative">
            {isMetaAttack && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
                <span className="text-black text-4xl">⭐</span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-accent text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div>Vencedor</div>
                  {winnerStigma && (
                    <img 
                      src={getStigmaById(winnerStigma)?.imagem} 
                      alt="Estigma do time vencedor"
                      className="w-10 h-10 mt-2"
                    />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="winner-stigma" className="text-foreground mb-2 block">
                  Estigma
                </Label>
                <Select value={winnerStigma} onValueChange={setWinnerStigma}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Selecione um estigma" />
                  </SelectTrigger>
                  <SelectContent>
                    {stigmas.map((stigma) => (
                      <SelectItem key={stigma.id} value={stigma.id}>
                        <div className="flex items-center gap-2">
                          <img src={stigma.imagem} alt={stigma.nome} className="w-6 h-6" />
                          {stigma.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {winnerTeam.map(knight => (
                  <div key={knight.id} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
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
                  <p className="text-center text-muted-foreground pt-16">
                    Selecione cavaleiros para o time vencedor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Perdedor */}
          <Card className="bg-card border-purple-400 border-[3px] relative">
            <CardHeader>
              <CardTitle className="text-purple-400 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-2">💀</div>
                  <div>Perdedor</div>
                  {loserStigma && (
                    <img 
                      src={getStigmaById(loserStigma)?.imagem} 
                      alt="Estigma do time perdedor"
                      className="w-10 h-10 mt-2"
                    />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="loser-stigma" className="text-foreground mb-2 block">
                  Estigma
                </Label>
                <Select value={loserStigma} onValueChange={setLoserStigma}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Selecione um estigma" />
                  </SelectTrigger>
                  <SelectContent>
                    {stigmas.map((stigma) => (
                      <SelectItem key={stigma.id} value={stigma.id}>
                        <div className="flex items-center gap-2">
                          <img src={stigma.imagem} alt={stigma.nome} className="w-6 h-6" />
                          {stigma.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {loserTeam.map(knight => (
                  <div key={knight.id} className="flex items-center justify-between p-3 bg-purple-400/5 rounded-lg border border-purple-400/20">
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
                  <p className="text-center text-muted-foreground pt-16">
                    Selecione cavaleiros para o time perdedor
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta de Ataque e Categoria */}
        <div className="mt-3 mb-6 flex items-center justify-end gap-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="categoria" className="text-foreground text-muted-foreground">
              Categoria
            </Label>
            <Select value={battleType} onValueChange={setBattleType}>
              <SelectTrigger className="w-[200px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Athena">Athena</SelectItem>
                <SelectItem value="Econômico">Econômico</SelectItem>
                <SelectItem value="Hades">Hades</SelectItem>
                <SelectItem value="Lua">Lua</SelectItem>
                <SelectItem value="Padrão">Padrão</SelectItem>
                <SelectItem value="Poseidon">Poseidon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="meta-attack" 
              checked={isMetaAttack} 
              onCheckedChange={(checked) => setIsMetaAttack(checked as boolean)} 
            />
            <Label htmlFor="meta-attack" className="text-foreground cursor-pointer text-muted-foreground">
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
                disabled={winnerTeam.length !== 3 || loserTeam.length !== 3 || !winnerStigma || !loserStigma}
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>

        {/* Título dos Cavaleiros Disponíveis */}
        <div className="mt-8 mb-4">
          <h2 className="text-2xl font-bold text-foreground text-center">Cavaleiros Disponíveis</h2>
        </div>

        {/* Lista de Cavaleiros Disponíveis */}
        <Card className="bg-card border-none">
          <CardContent className="p-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredKnights.map(knight => {
                const isInBothTeams = isKnightInBothTeams(knight.id);
                const isInWinnerTeam = isKnightInTeam(knight.id, 'winner');
                const isInLoserTeam = isKnightInTeam(knight.id, 'loser');
                
                return (
                  <div key={knight.id} className={`p-3 rounded-lg border transition-all duration-300 ${isInBothTeams ? 'bg-muted opacity-50' : 'bg-background'} border-border hover:border-accent/50 cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <img 
                          src={knight.image_url} 
                          alt={knight.name} 
                          className="w-10 h-10 rounded-full border border-border" 
                        />
                        <span className={`font-medium ${isInBothTeams ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {knight.name}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => addToTeam(knight, 'winner')}
                          disabled={winnerTeam.length >= 3 || isInBothTeams || isInWinnerTeam}
                          className="text-xs text-white hover:opacity-80 px-2 py-1 bg-yellow-400 hover:text-white"
                        >
                          Vencedor
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => addToTeam(knight, 'loser')}
                          disabled={loserTeam.length >= 3 || isInBothTeams || isInLoserTeam}
                          className="text-xs bg-gradient-cosmic text-white hover:opacity-80 hover:text-white px-2 py-1"
                        >
                          Perdedor
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
