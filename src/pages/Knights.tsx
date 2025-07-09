import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKnight, setSelectedKnight] = useState<Knight | null>(null);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKnightName, setNewKnightName] = useState("");
  const [newKnightImage, setNewKnightImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnights();
    fetchBattles();
  }, []);

  const fetchKnights = async () => {
    try {
      const { data, error } = await supabase
        .from('knights')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBattles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar batalhas:', error);
    }
  };

  const filteredKnights = knights.filter(knight =>
    knight.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKnightClick = (knight: Knight) => {
    setSelectedKnight(knight);
  };

  const getKnightHistory = (knightId: string) => {
    const victories = battles.filter(battle => 
      battle.winner_team.includes(knightId)
    );
    const defeats = battles.filter(battle => 
      battle.loser_team.includes(knightId)
    );
    
    return { victories, defeats };
  };

  const handleAddKnight = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKnightName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cavaleiro é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('knights')
        .insert([
          {
            name: newKnightName.trim(),
            image_url: newKnightImage || "/placeholder.svg",
            created_by: (await supabase.auth.getUser()).data.user?.id!
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setKnights([data, ...knights]);
      setNewKnightName("");
      setNewKnightImage("");
      setShowAddForm(false);
      
      toast({
        title: "Cavaleiro Adicionado!",
        description: `${data.name} foi adicionado ao sistema`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cavaleiro",
        variant: "destructive"
      });
    }
  };

  const getKnightName = (knightId: string) => {
    const knight = knights.find(k => k.id === knightId);
    return knight ? knight.name : "Cavaleiro removido";
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

  const knightHistory = selectedKnight ? getKnightHistory(selectedKnight.id) : null;

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Cavaleiros da Guerra dos Tronos
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar cavaleiro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border w-64"
              />
            </div>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-cosmic text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cavaleiro
            </Button>
          </div>

          {showAddForm && (
            <Card className="bg-card border-accent/20 shadow-cosmic mb-6 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-accent">Novo Cavaleiro</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddKnight} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newKnightName}
                      onChange={(e) => setNewKnightName(e.target.value)}
                      placeholder="Nome do cavaleiro"
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">URL da Imagem (opcional)</Label>
                    <Input
                      id="image"
                      value={newKnightImage}
                      onChange={(e) => setNewKnightImage(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-border"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {!selectedKnight ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredKnights.map((knight) => (
              <Card 
                key={knight.id} 
                className="bg-card border-border shadow-cosmic hover:shadow-gold transition-all duration-300 cursor-pointer"
                onClick={() => handleKnightClick(knight)}
              >
                <CardContent className="p-4 text-center">
                  <img
                    src={knight.image_url}
                    alt={knight.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-accent/20"
                  />
                  <h3 className="text-foreground font-semibold">{knight.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-card border-border shadow-cosmic">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-accent flex items-center gap-3">
                    <img
                      src={selectedKnight.image_url}
                      alt={selectedKnight.name}
                      className="w-12 h-12 rounded-full border-2 border-accent/20"
                    />
                    Histórico de {selectedKnight.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedKnight(null)}
                    className="border-border"
                  >
                    Voltar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vitórias */}
                <div>
                  <h3 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
                    🏆 Vitórias ({knightHistory?.victories?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {knightHistory?.victories?.length ? (
                      knightHistory.victories.map((battle, index) => (
                        <Card key={index} className="bg-accent/5 border-accent/20">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-accent">
                                Time Aliado:
                              </p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {battle.winner_team.map((ally, i) => (
                                  <Badge key={i} className="bg-accent/10 text-accent">
                                    {getKnightName(ally)}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Derrotou:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {battle.loser_team.map((enemy, i) => (
                                  <Badge key={i} variant="outline" className="text-muted-foreground">
                                    {getKnightName(enemy)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma vitória registrada
                      </p>
                    )}
                  </div>
                </div>

                {/* Derrotas */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    💀 Derrotas ({knightHistory?.defeats?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {knightHistory?.defeats?.length ? (
                      knightHistory.defeats.map((battle, index) => (
                        <Card key={index} className="bg-primary/5 border-primary/20">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-primary">
                                Time Aliado:
                              </p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {battle.loser_team.map((ally, i) => (
                                  <Badge key={i} className="bg-primary/10 text-primary">
                                    {getKnightName(ally)}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Perdeu para:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {battle.winner_team.map((enemy, i) => (
                                  <Badge key={i} variant="outline" className="text-muted-foreground">
                                    {getKnightName(enemy)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhuma derrota registrada
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Knights;