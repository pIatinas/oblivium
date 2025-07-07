import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";

// Mock data para demonstração
const mockKnights = [
  { id: 1, name: "Jon Snow", image: "/placeholder.svg" },
  { id: 2, name: "Daenerys Targaryen", image: "/placeholder.svg" },
  { id: 3, name: "Tyrion Lannister", image: "/placeholder.svg" },
  { id: 4, name: "Arya Stark", image: "/placeholder.svg" },
  { id: 5, name: "Sansa Stark", image: "/placeholder.svg" },
  { id: 6, name: "Jaime Lannister", image: "/placeholder.svg" }
];

const mockBattleHistory = {
  1: { // Jon Snow
    victories: [
      { battleId: 1, againstTeam: ["Tyrion Lannister", "Sansa Stark"], allies: ["Daenerys Targaryen", "Arya Stark"] },
      { battleId: 3, againstTeam: ["Jaime Lannister"], allies: ["Daenerys Targaryen"] }
    ],
    defeats: [
      { battleId: 2, againstTeam: ["Arya Stark", "Tyrion Lannister"], allies: ["Sansa Stark"] }
    ]
  },
  2: { // Daenerys
    victories: [
      { battleId: 1, againstTeam: ["Tyrion Lannister", "Sansa Stark"], allies: ["Jon Snow", "Arya Stark"] }
    ],
    defeats: []
  }
};

const Knights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKnight, setSelectedKnight] = useState<any>(null);
  const [knights] = useState(mockKnights);

  const filteredKnights = knights.filter(knight =>
    knight.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKnightClick = (knight: any) => {
    setSelectedKnight(knight);
  };

  const knightHistory = selectedKnight ? mockBattleHistory[selectedKnight.id as keyof typeof mockBattleHistory] : null;

  return (
    <div className="min-h-screen bg-gradient-nebula p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Cavaleiros da Guerra dos Tronos
          </h1>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar cavaleiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
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
                    src={knight.image}
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
                      src={selectedKnight.image}
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
                                {battle.allies.map((ally, i) => (
                                  <Badge key={i} className="bg-accent/10 text-accent">
                                    {ally}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Derrotou:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {battle.againstTeam.map((enemy, i) => (
                                  <Badge key={i} variant="outline" className="text-muted-foreground">
                                    {enemy}
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
                                {battle.allies.map((ally, i) => (
                                  <Badge key={i} className="bg-primary/10 text-primary">
                                    {ally}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Perdeu para:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {battle.againstTeam.map((enemy, i) => (
                                  <Badge key={i} variant="outline" className="text-muted-foreground">
                                    {enemy}
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