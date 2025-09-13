import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Knight {
  id: string;
  name: string;
  image_url: string | null;
}

interface UserKnight {
  id: string;
  knight_id: string;
  is_used: boolean;
  knights: Knight;
}

interface Battle {
  id: string;
  tipo: string;
  created_at: string;
  winner_team: string[];
  loser_team: string[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  battle_id: string;
  battles: {
    id: string;
    tipo: string;
  };
}

const Members = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [knights, setKnights] = useState<Knight[]>([]);
  const [userKnights, setUserKnights] = useState<UserKnight[]>([]);
  const [userBattles, setUserBattles] = useState<Battle[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [selectedKnights, setSelectedKnights] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const itemsPerPage = 4;

  const targetUserId = userId || user?.id;
  const canManage = isAdmin || targetUserId === user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchUserProfile();
      fetchKnights();
      fetchUserKnights();
      fetchUserBattles();
      fetchUserComments();
    }
  }, [targetUserId]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();
    setUserProfile(data);
  };

  const fetchKnights = async () => {
    const { data } = await supabase
      .from('knights')
      .select('*')
      .order('name');
    setKnights(data || []);
  };

  const fetchUserKnights = async () => {
    const { data } = await supabase
      .from('user_knights')
      .select(`
        *,
        knights (*)
      `)
      .eq('user_id', targetUserId);
    setUserKnights(data || []);
  };

  const fetchUserBattles = async () => {
    const { data } = await supabase
      .from('battles')
      .select('*')
      .eq('created_by', targetUserId)
      .order('created_at', { ascending: false });
    setUserBattles(data || []);
  };

  const fetchUserComments = async () => {
    const { data } = await supabase
      .from('battle_comments')
      .select(`
        *,
        battles (id, tipo)
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });
    setUserComments(data || []);
  };

  const handleKnightSelection = (knightId: string) => {
    setSelectedKnights(prev => 
      prev.includes(knightId) 
        ? prev.filter(id => id !== knightId)
        : [...prev, knightId]
    );
  };

  const saveKnightSelection = async () => {
    try {
      // Remove all current selections
      await supabase
        .from('user_knights')
        .delete()
        .eq('user_id', targetUserId);

      // Add new selections
      if (selectedKnights.length > 0) {
        const insertData = selectedKnights.map(knightId => ({
          user_id: targetUserId,
          knight_id: knightId,
          is_used: false
        }));

        await supabase
          .from('user_knights')
          .insert(insertData);
      }

      fetchUserKnights();
      setIsModalOpen(false);
      toast.success('Cavaleiros salvos com sucesso!');
    } catch (error) {
      console.error('Error saving knights:', error);
      toast.error('Erro ao salvar cavaleiros');
    }
  };

  const toggleKnightUsage = async (userKnightId: string, currentUsed: boolean) => {
    if (!canManage) return;

    const { error } = await supabase
      .from('user_knights')
      .update({ is_used: !currentUsed })
      .eq('id', userKnightId);

    if (error) {
      toast.error('Erro ao atualizar cavaleiro');
    } else {
      fetchUserKnights();
    }
  };

  const resetAllKnights = async () => {
    if (!canManage) return;

    const { error } = await supabase
      .from('user_knights')
      .update({ is_used: false })
      .eq('user_id', targetUserId);

    if (error) {
      toast.error('Erro ao resetar cavaleiros');
    } else {
      fetchUserKnights();
      toast.success('Cavaleiros resetados!');
    }
  };

  const openKnightModal = () => {
    const currentSelected = userKnights.map(uk => uk.knight_id);
    setSelectedKnights(currentSelected);
    setIsModalOpen(true);
  };

  const paginatedBattles = userBattles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedComments = userComments.slice((commentsPage - 1) * itemsPerPage, commentsPage * itemsPerPage);
  const totalBattlePages = Math.ceil(userBattles.length / itemsPerPage);
  const totalCommentPages = Math.ceil(userComments.length / itemsPerPage);

  return (
    <>
      <SEOHead 
        title={`Perfil ${userProfile?.full_name || 'Membro'} - Oblivium`}
        description={`Perfil de ${userProfile?.full_name || 'membro'} no Oblivium - cavaleiros, batalhas e comentários.`}
      />
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-accent mb-2">
              {userId ? `Perfil de ${userProfile?.full_name || 'Membro'}` : 'Meu Perfil'}
            </h1>
          </div>

          {/* Cavaleiros Disponíveis */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Cavaleiros Disponíveis</h2>
              {canManage && (
                <div className="flex gap-2">
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openKnightModal} className="bg-foreground text-background hover:bg-foreground/90">
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Selecionar Cavaleiros</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                        {knights.map((knight) => (
                          <div key={knight.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={knight.id}
                              checked={selectedKnights.includes(knight.id)}
                              onCheckedChange={() => handleKnightSelection(knight.id)}
                            />
                            <label htmlFor={knight.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                              {knight.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveKnightSelection}>
                          Salvar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    onClick={resetAllKnights}
                    className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                  >
                    Resetar
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-4">
              {userKnights.map((userKnight) => (
                <div 
                  key={userKnight.id}
                  className={`cursor-pointer transition-opacity ${canManage ? 'hover:scale-105' : ''} ${userKnight.is_used ? 'opacity-40' : 'opacity-100'}`}
                  onClick={() => canManage && toggleKnightUsage(userKnight.id, userKnight.is_used)}
                >
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userKnight.knights.image_url || '/placeholder.svg'} alt={userKnight.knights.name} />
                    <AvatarFallback>{userKnight.knights.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </section>

          {/* Minhas Batalhas */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Minhas Batalhas</h2>
              <Badge variant="secondary">{userBattles.length} batalhas</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {paginatedBattles.map((battle) => (
                <Card key={battle.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-accent mb-2">BATALHA</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(battle.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <Badge className="mt-2">{battle.tipo}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalBattlePages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalBattlePages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </section>

          {/* Meus Comentários */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Meus Comentários</h2>
              <Badge variant="secondary">{userComments.length} comentários</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {paginatedComments.map((comment) => (
                <Card key={comment.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-accent mb-2">
                        {format(new Date(comment.created_at), "dd/MM/yy", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-foreground mb-4">{comment.content}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `/battles/${comment.battle_id}`}
                      >
                        Ver Batalha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalCommentPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalCommentPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={commentsPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCommentsPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default Members;