import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";
interface Knight {
  id: string;
  name: string;
  image_url: string;
}
interface Battle {
  id: string;
  winner_team: string[];
  loser_team: string[];
  meta: boolean | null;
  tipo: string;
  created_at: string;
  created_by: string;
}
interface Profile {
  id: string;
  full_name: string | null;
  user_id: string;
  role: string | null;
}
const Battles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [battles, setBattles] = useState<Battle[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const itemsPerPage = 12;
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchBattles();
    fetchKnights();
    fetchProfiles();
    getCurrentUser();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };
  const fetchBattles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('battles').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setBattles((data || []).map((battle: any) => ({
        ...battle,
        meta: battle.meta || false
      })));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as batalhas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchKnights = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('knights').select('*');
      if (error) throw error;
      setKnights(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cavaleiros:', error);
    }
  };
  const fetchProfiles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar perfis:', error);
    }
  };
  const getKnightById = (knightId: string) => {
    return knights.find(k => k.id === knightId);
  };
  const getProfileByUserId = (userId: string) => {
    return profiles.find(p => p.user_id === userId);
  };

  const isAdmin = () => {
    const userProfile = profiles.find(p => p.user_id === currentUser?.id);
    return userProfile?.role === 'admin';
  };

  const deleteBattle = async (battleId: string) => {
    try {
      const { error } = await supabase.from('battles').delete().eq('id', battleId);
      if (error) throw error;
      
      toast({
        title: "Batalha Excluída!",
        description: "A batalha foi excluída com sucesso"
      });
      
      fetchBattles();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a batalha",
        variant: "destructive"
      });
    }
  };

  const filteredBattles = battles.filter(battle => {
    const allKnights = [...battle.winner_team, ...battle.loser_team];
    const matchesSearch = allKnights.some(knightId => {
      const knight = getKnightById(knightId);
      return knight && knight.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const matchesType = typeFilter === "all" || battle.tipo === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredBattles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBattles = filteredBattles.slice(startIndex, startIndex + itemsPerPage);
  if (loading) {
    return <div className="min-h-screen bg-gradient-nebula">
        <Header />
        <div className="max-w-6xl mx-auto p-6 text-center">
          <div className="text-accent text-xl">Carregando batalhas...</div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-nebula">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <Breadcrumb />
          <div className="mb-8">
           <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
             Batalhas
           </h1>
           
           <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
               <Input placeholder="Busca" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-card border-border" />
             </div>
             <Select value={typeFilter} onValueChange={setTypeFilter}>
               <SelectTrigger className="w-[200px] bg-card border-border">
                 <SelectValue placeholder="Tipo" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todos os tipos</SelectItem>
                 <SelectItem value="Padrão">Padrão</SelectItem>
                 <SelectItem value="Cavaleiros de Hades">Cavaleiros de Hades</SelectItem>
                 <SelectItem value="Cavaleiros da Lua">Cavaleiros da Lua</SelectItem>
                 <SelectItem value="Cavaleiros de Athena">Cavaleiros de Athena</SelectItem>
                 <SelectItem value="Cavaleiros de Poseidon">Cavaleiros de Poseidon</SelectItem>
                 <SelectItem value="Cavaleiros Econômicos">Cavaleiros Econômicos</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </div>

        <div className="grid gap-6 md:grid-cols-2">
          {paginatedBattles.map(battle => <Card key={battle.id} className="bg-card hover:bg-card/80 transition-all duration-300 relative border-none shadow-none cursor-pointer" onClick={() => window.location.href = `/battles/${battle.id}`}>
              {battle.meta && <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-transparent">
                  <span className="text-black text-xl">⭐</span>
                </div>}
              
              {/* Delete button for admins */}
              {isAdmin() && <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="absolute top-2 left-2 w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 z-20" onClick={e => e.stopPropagation()}>
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta batalha? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteBattle(battle.id)} className="bg-red-500 hover:bg-red-600">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>}
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Time Vencedor */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-accent font-semibold text-center flex items-center justify-center gap-2">
                      Vencedor
                    </h3>
                    <div className="flex gap-2 justify-center">
                      {battle.winner_team.slice(0, 3).map((knightId, index) => {
                    const knight = getKnightById(knightId);
                    return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                      e.stopPropagation();
                      window.location.href = `/knights?knight=${knight.id}`;
                    }}>
                            <img src={knight.image_url} alt={knight.name} className="w-8 h-8 rounded-full border border-accent/20 hover:border-accent/40" />
                            <span className="text-xs text-foreground hover:text-accent transition-colors">
                              {knight.name}
                            </span>
                          </div> : null;
                  })}
                    </div>
                  </div>

                  {/* X Separador */}
                  <div className="text-3xl font-bold text-muted-foreground">
                    ✕
                  </div>

                  {/* Time Perdedor */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-purple-400 font-semibold text-center flex items-center justify-center gap-2">
                      Perdedor
                    </h3>
                    <div className="flex gap-2 justify-center">
                      {battle.loser_team.slice(0, 3).map((knightId, index) => {
                    const knight = getKnightById(knightId);
                    return knight ? <div key={index} className="flex flex-col items-center gap-1 cursor-pointer" onClick={e => {
                      e.stopPropagation();
                      window.location.href = `/knights?knight=${knight.id}`;
                    }}>
                            <img src={knight.image_url} alt={knight.name} className="w-8 h-8 rounded-full border border-purple-400/20 hover:border-purple-400/40" />
                            <span className="text-xs text-purple-300 hover:text-purple-400 transition-colors">
                              {knight.name}
                            </span>
                          </div> : null;
                  })}
                    </div>
                  </div>
                </div>
                
                {/* Informação do autor */}
                <div className="absolute bottom-[-10px] right-[10px] bg-card px-2 py-1 rounded text-xs text-muted-foreground">
                  por {getProfileByUserId(battle.created_by)?.full_name || 'Usuário'}
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Pagination */}
        {totalPages > 1 && <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {currentPage < totalPages && <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>}
              </PaginationContent>
            </Pagination>
          </div>}

        {filteredBattles.length === 0 && <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm || typeFilter !== "all" ? "Nenhuma batalha encontrada com os filtros aplicados" : "Nenhuma batalha cadastrada"}
            </p>
          </div>}
      </div>
      <Footer />
    </div>;
};
export default Battles;