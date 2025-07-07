import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sword, Search, Plus, Archive, Users } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-nebula">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Guia para consulta de lutas da Guerra dos Tronos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Registrar Batalha */}
          <Card className="bg-card border-accent/20 shadow-cosmic hover:shadow-gold transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-accent">Registrar Batalha</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Adicione uma nova batalha ao arquivo cósmico
              </p>
              <Button asChild className="bg-gradient-cosmic text-primary-foreground hover:opacity-90">
                <Link to="/create-battle">
                  Criar Nova Batalha
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ver Batalhas */}
          <Card className="bg-card border-border shadow-cosmic hover:shadow-gold transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Archive className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-foreground">Arquivo de Batalhas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Consulte todas as batalhas registradas
              </p>
              <Button asChild variant="outline" className="border-accent/20 text-accent hover:bg-accent/10">
                <Link to="/battles">
                  Ver Batalhas
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Cavaleiros */}
          <Card className="bg-card border-border shadow-cosmic hover:shadow-gold transition-all duration-300 group md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-foreground">Cavaleiros</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Consulte o histórico de cada cavaleiro
              </p>
              <Button asChild variant="secondary">
                <Link to="/knights">
                  Ver Cavaleiros
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-8 shadow-cosmic">
          <h3 className="text-2xl font-bold text-center text-foreground mb-6">
            Status do Arquivo Cósmico
          </h3>
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">12</div>
              <div className="text-muted-foreground">Batalhas Registradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">36</div>
              <div className="text-muted-foreground">Cavaleiros Catalogados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">8</div>
              <div className="text-muted-foreground">Times Ativos</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/30 backdrop-blur-sm border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-muted-foreground">
            Que o cosmos guie suas estratégias de batalha ✨
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
