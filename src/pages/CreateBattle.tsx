import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

// Mock data de cavaleiros disponíveis
const mockKnights = [
  "Jon Snow", "Daenerys Targaryen", "Tyrion Lannister", "Arya Stark", 
  "Sansa Stark", "Jaime Lannister", "Cersei Lannister", "Bran Stark",
  "Samwell Tarly", "Jorah Mormont", "Theon Greyjoy", "Yara Greyjoy"
];

const CreateBattle = () => {
  const { toast } = useToast();
  const [winnerCharacters, setWinnerCharacters] = useState<string[]>([]);
  const [loserCharacters, setLoserCharacters] = useState<string[]>([]);
  const [selectedWinnerKnight, setSelectedWinnerKnight] = useState("");
  const [selectedLoserKnight, setSelectedLoserKnight] = useState("");

  const addWinnerCharacter = () => {
    if (selectedWinnerKnight && !winnerCharacters.includes(selectedWinnerKnight)) {
      setWinnerCharacters([...winnerCharacters, selectedWinnerKnight]);
      setSelectedWinnerKnight("");
    }
  };

  const addLoserCharacter = () => {
    if (selectedLoserKnight && !loserCharacters.includes(selectedLoserKnight)) {
      setLoserCharacters([...loserCharacters, selectedLoserKnight]);
      setSelectedLoserKnight("");
    }
  };

  const removeWinnerCharacter = (char: string) => {
    setWinnerCharacters(winnerCharacters.filter(c => c !== char));
  };

  const removeLoserCharacter = (char: string) => {
    setLoserCharacters(loserCharacters.filter(c => c !== char));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (winnerCharacters.length === 0 || loserCharacters.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um personagem em cada time",
        variant: "destructive"
      });
      return;
    }

    // Aqui será implementada a integração com o banco de dados
    toast({
      title: "Batalha Registrada!",
      description: "A batalha foi adicionada ao arquivo cósmico",
      variant: "default"
    });

    // Reset form
    setWinnerCharacters([]);
    setLoserCharacters([]);
    setSelectedWinnerKnight("");
    setSelectedLoserKnight("");
  };

  const availableWinnerKnights = mockKnights.filter(knight => !winnerCharacters.includes(knight) && !loserCharacters.includes(knight));
  const availableLoserKnights = mockKnights.filter(knight => !loserCharacters.includes(knight) && !winnerCharacters.includes(knight));

  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          Registrar Nova Batalha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Time Vencedor */}
            <Card className="bg-card border-accent/20 shadow-cosmic">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  🏆 Time Vencedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selecionar Cavaleiros</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedWinnerKnight} onValueChange={setSelectedWinnerKnight}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Escolha um cavaleiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableWinnerKnights.map((knight) => (
                          <SelectItem key={knight} value={knight}>
                            {knight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      onClick={addWinnerCharacter}
                      disabled={!selectedWinnerKnight}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {winnerCharacters.map((char) => (
                      <Badge key={char} className="bg-accent/10 text-accent border-accent/20">
                        {char}
                        <button
                          type="button"
                          onClick={() => removeWinnerCharacter(char)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Perdedor */}
            <Card className="bg-card border-border shadow-cosmic">
              <CardHeader>
                <CardTitle className="text-muted-foreground flex items-center gap-2">
                  💀 Time Perdedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selecionar Cavaleiros</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedLoserKnight} onValueChange={setSelectedLoserKnight}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Escolha um cavaleiro" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLoserKnights.map((knight) => (
                          <SelectItem key={knight} value={knight}>
                            {knight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      onClick={addLoserCharacter}
                      disabled={!selectedLoserKnight}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {loserCharacters.map((char) => (
                      <Badge key={char} className="bg-primary/10 text-primary border-primary/20">
                        {char}
                        <button
                          type="button"
                          onClick={() => removeLoserCharacter(char)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-gradient-cosmic text-primary-foreground shadow-cosmic hover:shadow-gold transition-all duration-300"
            >
              Registrar Batalha no Cosmos
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBattle;