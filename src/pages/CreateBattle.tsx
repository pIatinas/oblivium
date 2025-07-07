import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateBattle = () => {
  const { toast } = useToast();
  const [winnerCharacters, setWinnerCharacters] = useState<string[]>([]);
  const [loserCharacters, setLoserCharacters] = useState<string[]>([]);
  const [newWinnerChar, setNewWinnerChar] = useState("");
  const [newLoserChar, setNewLoserChar] = useState("");
  const [winnerImage, setWinnerImage] = useState<File | null>(null);
  const [loserImage, setLoserImage] = useState<File | null>(null);

  const addWinnerCharacter = () => {
    if (newWinnerChar.trim() && !winnerCharacters.includes(newWinnerChar.trim())) {
      setWinnerCharacters([...winnerCharacters, newWinnerChar.trim()]);
      setNewWinnerChar("");
    }
  };

  const addLoserCharacter = () => {
    if (newLoserChar.trim() && !loserCharacters.includes(newLoserChar.trim())) {
      setLoserCharacters([...loserCharacters, newLoserChar.trim()]);
      setNewLoserChar("");
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
    setWinnerImage(null);
    setLoserImage(null);
  };

  const handleImageUpload = (file: File | null, team: 'winner' | 'loser') => {
    if (team === 'winner') {
      setWinnerImage(file);
    } else {
      setLoserImage(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-nebula p-6">
      <div className="max-w-4xl mx-auto">
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
                  <Label htmlFor="winner-image">Imagem do Time</Label>
                  <div className="mt-2">
                    <input
                      id="winner-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null, 'winner')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('winner-image')?.click()}
                      className="w-full border-accent/20 text-accent hover:bg-accent/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {winnerImage ? winnerImage.name : "Escolher Imagem"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Personagens</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newWinnerChar}
                      onChange={(e) => setNewWinnerChar(e.target.value)}
                      placeholder="Nome do personagem"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWinnerCharacter())}
                      className="bg-background border-border"
                    />
                    <Button 
                      type="button" 
                      onClick={addWinnerCharacter}
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
                  <Label htmlFor="loser-image">Imagem do Time</Label>
                  <div className="mt-2">
                    <input
                      id="loser-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null, 'loser')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('loser-image')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loserImage ? loserImage.name : "Escolher Imagem"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Personagens</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newLoserChar}
                      onChange={(e) => setNewLoserChar(e.target.value)}
                      placeholder="Nome do personagem"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLoserCharacter())}
                      className="bg-background border-border"
                    />
                    <Button type="button" onClick={addLoserCharacter}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {loserCharacters.map((char) => (
                      <Badge key={char} variant="outline" className="text-muted-foreground">
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