import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Trophy, Skull } from "lucide-react";

// Mock data para demonstração
const mockSearchResults = {
  "Seiya": {
    victories: [
      { battleId: 1, againstTeam: ["Ikki", "Shun", "Jabu"], date: "2024-01-15" },
      { battleId: 5, againstTeam: ["Aiolia", "Milo", "Camus"], date: "2024-01-10" }
    ],
    defeats: [
      { battleId: 3, againstTeam: ["Mu", "Aldebaran", "Saga"], date: "2024-01-12" }
    ]
  },
  "Ikki": {
    victories: [
      { battleId: 4, againstTeam: ["Hyoga", "Shiryu", "Shun"], date: "2024-01-11" }
    ],
    defeats: [
      { battleId: 1, againstTeam: ["Seiya", "Shiryu", "Hyoga"], date: "2024-01-15" },
      { battleId: 6, againstTeam: ["Saga", "Kanon", "Gemini"], date: "2024-01-08" }
    ]
  }
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    const result = mockSearchResults[searchTerm as keyof typeof mockSearchResults];
    setSearchResult(result || null);
  };

  return (
    <div className="min-h-screen bg-gradient-nebula p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          Busca Avançada de Batalhas
        </h1>

        <div className="mb-8">
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Digite o nome do personagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-card border-border"
            />
            <Button 
              onClick={handleSearch}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <SearchIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {searchResult && (
          <div className="space-y-6">
            <Card className="bg-card border-border shadow-cosmic">
              <CardHeader>
                <CardTitle className="text-accent text-center">
                  Histórico de {searchTerm}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="victories" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted">
                    <TabsTrigger value="victories" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      <Trophy className="w-4 h-4 mr-2" />
                      Vitórias ({searchResult.victories?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="defeats" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                      <Skull className="w-4 h-4 mr-2" />
                      Derrotas ({searchResult.defeats?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="victories" className="space-y-4 mt-6">
                    {searchResult.victories?.length > 0 ? (
                      searchResult.victories.map((battle: any, index: number) => (
                        <Card key={index} className="bg-accent/5 border-accent/20">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-muted-foreground">
                                Batalha #{battle.battleId}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(battle.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-2 text-accent">
                              🏆 Vitória contra:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {battle.againstTeam.map((char: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-muted-foreground">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma vitória registrada
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="defeats" className="space-y-4 mt-6">
                    {searchResult.defeats?.length > 0 ? (
                      searchResult.defeats.map((battle: any, index: number) => (
                        <Card key={index} className="bg-destructive/5 border-destructive/20">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-muted-foreground">
                                Batalha #{battle.battleId}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(battle.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-2 text-destructive">
                              💀 Derrota para:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {battle.againstTeam.map((char: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-muted-foreground">
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma derrota registrada
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {searchTerm && !searchResult && (
          <Card className="bg-card border-border shadow-cosmic">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Personagem "{searchTerm}" não encontrado no arquivo de batalhas
              </p>
            </CardContent>
          </Card>
        )}

        {!searchTerm && (
          <Card className="bg-card border-border shadow-cosmic">
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Digite o nome de um personagem para ver seu histórico de batalhas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Search;