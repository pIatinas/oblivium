import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

// Mock data para demonstração
const mockBattles = [
  {
    id: 1,
    winnerTeam: {
      image: "/placeholder.svg",
      characters: ["Seiya", "Shiryu", "Hyoga"]
    },
    loserTeam: {
      image: "/placeholder.svg", 
      characters: ["Ikki", "Shun", "Jabu"]
    },
    date: "2024-01-15"
  },
  {
    id: 2,
    winnerTeam: {
      image: "/placeholder.svg",
      characters: ["Mu", "Aldebaran", "Saga"]
    },
    loserTeam: {
      image: "/placeholder.svg",
      characters: ["Aiolia", "Shaka", "Dohko"]
    },
    date: "2024-01-14"
  }
];

const Battles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [battles] = useState(mockBattles);

  const filteredBattles = battles.filter(battle =>
    battle.winnerTeam.characters.some(char => 
      char.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    battle.loserTeam.characters.some(char => 
      char.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-nebula p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Arquivo de Batalhas Cósmicas
          </h1>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por personagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBattles.map((battle) => (
            <Card key={battle.id} className="bg-card border-border shadow-cosmic hover:shadow-gold transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-center text-accent">
                  Batalha #{battle.id}
                </CardTitle>
                <p className="text-center text-muted-foreground text-sm">
                  {new Date(battle.date).toLocaleDateString('pt-BR')}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Time Vencedor */}
                <div className="space-y-2">
                  <h3 className="text-accent font-semibold flex items-center gap-2">
                    🏆 Time Vencedor
                  </h3>
                  <img
                    src={battle.winnerTeam.image}
                    alt="Time Vencedor"
                    className="w-full h-32 object-cover rounded-lg border border-accent/20"
                  />
                  <div className="flex flex-wrap gap-1">
                    {battle.winnerTeam.characters.map((char, index) => (
                      <Badge key={index} variant="secondary" className="bg-accent/10 text-accent">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Time Perdedor */}
                <div className="space-y-2">
                  <h3 className="text-muted-foreground font-semibold flex items-center gap-2">
                    💀 Time Perdedor
                  </h3>
                  <img
                    src={battle.loserTeam.image}
                    alt="Time Perdedor"
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <div className="flex flex-wrap gap-1">
                    {battle.loserTeam.characters.map((char, index) => (
                      <Badge key={index} variant="outline" className="text-muted-foreground">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBattles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma batalha encontrada para "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Battles;