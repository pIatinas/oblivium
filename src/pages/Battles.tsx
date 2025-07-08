import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Header from "@/components/Header";

// Mock data para demonstração
const mockBattles = [
  {
    id: 1,
    winnerTeam: {
      characters: ["Jon Snow", "Daenerys Targaryen", "Arya Stark"]
    },
    loserTeam: {
      characters: ["Tyrion Lannister", "Sansa Stark", "Jaime Lannister"]
    }
  },
  {
    id: 2,
    winnerTeam: {
      characters: ["Tyrion Lannister", "Arya Stark"]
    },
    loserTeam: {
      characters: ["Jon Snow", "Sansa Stark"]
    }
  },
  {
    id: 3,
    winnerTeam: {
      characters: ["Sansa Stark", "Jaime Lannister", "Daenerys Targaryen"]
    },
    loserTeam: {
      characters: ["Jon Snow", "Arya Stark"]
    }
  },
  {
    id: 4,
    winnerTeam: {
      characters: ["Jon Snow", "Tyrion Lannister"]
    },
    loserTeam: {
      characters: ["Daenerys Targaryen", "Jaime Lannister"]
    }
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
    <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Batalhas
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

        <div className="grid gap-6 md:grid-cols-2">
          {filteredBattles.map((battle) => (
            <Card key={battle.id} className="bg-card border-border shadow-cosmic hover:shadow-gold transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Time Vencedor */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-accent font-semibold text-center flex items-center justify-center gap-2">
                      🏆 Vencedor
                    </h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {battle.winnerTeam.characters.map((char, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <img
                            src="/placeholder.svg"
                            alt={char}
                            className="w-8 h-8 rounded-full border border-accent/20"
                          />
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                            {char}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X Separador */}
                  <div className="text-3xl font-bold text-muted-foreground">
                    ✕
                  </div>

                  {/* Time Perdedor */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-primary font-semibold text-center flex items-center justify-center gap-2">
                      💀 Perdedor
                    </h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {battle.loserTeam.characters.map((char, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <img
                            src="/placeholder.svg"
                            alt={char}
                            className="w-8 h-8 rounded-full border border-primary/20"
                          />
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {char}
                          </Badge>
                        </div>
                      ))}
                    </div>
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