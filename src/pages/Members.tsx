import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import UserBattleCard from '@/components/UserBattleCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import FavoriteKnightModal from '@/components/FavoriteKnightModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface Knight {
  id: string;
  name: string;
  image_url: string | null;
  slug: string | null;
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
  winner_team_stigma: string | null;
  loser_team_stigma: string | null;
  created_by: string;
  meta: boolean | null;
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
  const {
    slug
  } = useParams();
  const {
    user
  } = useAuth();
  const {
    isAdmin
  } = useAdmin();
  const location = useLocation();
  const [allKnights, setAllKnights] = useState<Knight[]>([]);
  const [userKnights, setUserKnights] = useState<UserKnight[]>([]);
  const [userBattles, setUserBattles] = useState<Battle[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [selectedKnights, setSelectedKnights] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stigmas, setStigmas] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const itemsPerPage = 4;

  // Handle direct access via slug
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const canManage = isAdmin || targetUserId === user?.id;

  // Effect to handle slug-based routing
  useEffect(() => {
    const fetchUserBySlug = async () => {
      if (slug) {
        // Extract user slug from the URL parameter
        const userSlug = slug.split('-').slice(1).join('-'); // Remove the prefix (like "d08")
        const {
          data: profiles
        } = await supabase.from('profiles').select('user_id, full_name').ilike('full_name', `%${userSlug}%`).limit(1);
        if (profiles && profiles.length > 0) {
          setTargetUserId(profiles[0].user_id);
        }
      } else if (location.state?.userId) {
        setTargetUserId(location.state.userId);
      } else if (user?.id) {
        setTargetUserId(user.id);
      }
    };
    fetchUserBySlug();
  }, [slug, location.state?.userId, user?.id]);
  useEffect(() => {
    if (targetUserId) {
      fetchUserProfile();
      fetchAllKnights();
      fetchStigmas();
      fetchUserKnights();
      fetchUserBattles();
      fetchUserComments();
    }
  }, [targetUserId]);
  const fetchUserProfile = async () => {
    const {
      data
    } = await supabase.from('profiles').select('*, knights!favorite_knight_id(*)').eq('user_id', targetUserId).single();
    setUserProfile(data);
  };
  const fetchAllKnights = async () => {
    const {
      data
    } = await supabase.from('knights').select('*').order('name');
    setAllKnights(data || []);
  };
  const fetchStigmas = async () => {
    const {
      data
    } = await supabase.from('stigmas').select('*');
    setStigmas(data || []);
  };
  const fetchUserKnights = async () => {
    const {
      data: userKnightsData
    } = await supabase.from('user_knights').select('*').eq('user_id', targetUserId);
    if (userKnightsData) {
      const knightIds = userKnightsData.map(uk => uk.knight_id);
      const {
        data: knightsData
      } = await supabase.from('knights').select('*').in('id', knightIds);
      const userKnightsWithKnights = userKnightsData.map(uk => ({
        ...uk,
        knights: knightsData?.find(k => k.id === uk.knight_id) || null
      })).filter(uk => uk.knights);
      setUserKnights(userKnightsWithKnights);
    }
  };
  const fetchUserBattles = async () => {
    const {
      data
    } = await supabase.from('battles').select('*').eq('created_by', targetUserId).order('created_at', {
      ascending: false
    });
    setUserBattles(data || []);
  };
  const fetchUserComments = async () => {
    const {
      data: commentsData
    } = await supabase.from('battle_comments').select('*').eq('user_id', targetUserId).order('created_at', {
      ascending: false
    });
    if (commentsData) {
      const battleIds = commentsData.map(c => c.battle_id);
      const {
        data: battlesData
      } = await supabase.from('battles').select('id, tipo').in('id', battleIds);
      const commentsWithBattles = commentsData.map(comment => ({
        ...comment,
        battles: battlesData?.find(b => b.id === comment.battle_id) || null
      })).filter(c => c.battles);
      setUserComments(commentsWithBattles);
    }
  };
  const handleKnightSelection = (knightId: string) => {
    setSelectedKnights(prev => prev.includes(knightId) ? prev.filter(id => id !== knightId) : [...prev, knightId]);
  };
  const saveKnightSelection = async () => {
    try {
      // Remove all current selections
      await supabase.from('user_knights').delete().eq('user_id', targetUserId);

      // Add new selections
      if (selectedKnights.length > 0) {
        const insertData = selectedKnights.map(knightId => ({
          user_id: targetUserId,
          knight_id: knightId,
          is_used: false
        }));
        await supabase.from('user_knights').insert(insertData);
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
    const {
      error
    } = await supabase.from('user_knights').update({
      is_used: !currentUsed
    }).eq('id', userKnightId);
    if (error) {
      toast.error('Erro ao atualizar cavaleiro');
    } else {
      fetchUserKnights();
    }
  };
  const resetAllKnights = async () => {
    if (!canManage) return;
    const {
      error
    } = await supabase.from('user_knights').update({
      is_used: false
    }).eq('user_id', targetUserId);
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
  return <>
      <SEOHead title={`Perfil ${userProfile?.full_name || 'Membro'} - Oblivium`} description={`Perfil de ${userProfile?.full_name || 'membro'} no Oblivium - cavaleiros, batalhas e comentários.`} />
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumb memberName={userProfile?.full_name || 'Membro'} />
          <div className="flex flex-row-reverse justify-end items-center mb-6 ">
            <h1 className="text-3xl font-bold text-accent ml-4">
              {targetUserId && targetUserId !== user?.id ? `${userProfile?.full_name || 'Membro'}` : 'Meu Perfil'}
            </h1>
            
            {/* Avatar placeholder with favorite knight selector */}
            {canManage && <div className="">
                <div onClick={() => setIsFavoriteModalOpen(true)} className="w-20 h-20 rounded-full bg-card border-2 border-accent/30 cursor-pointer hover:border-accent/60 transition-colors flex items-center justify-center">
                  {userProfile?.favorite_knight_id ? <img src={allKnights.find(k => k.id === userProfile.favorite_knight_id)?.image_url || '/placeholder.svg'} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : <span className="text-muted-foreground text-xs">+</span>}
                </div>
              </div>}
          </div>

          {/* Cavaleiros Disponíveis */}
          <section className="mb-6 bg-card p-4 rounded-2xl ">
            <div className="flex items-center justify-between mb-2 lg:mb-5 ">
              <h2 className="text-xl text-foreground font-semibold leading-none mb-4 lg:mb-1">Cavaleiros <span className="text-accent">Disponíveis</span></h2>
              {canManage && <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openKnightModal} className="text-purple-500 bg-transparent p-0 -mt-4 lg:mt-0 hover:bg-transparent">
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Selecionar Cavaleiros</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                      {allKnights.map(knight => <div key={knight.id} className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={knight.image_url || '/placeholder.svg'} alt={knight.name} />
                            <AvatarFallback>{knight.name[0]}</AvatarFallback>
                          </Avatar>
                          <Checkbox id={knight.id} checked={selectedKnights.includes(knight.id)} onCheckedChange={() => handleKnightSelection(knight.id)} />
                          <label htmlFor={knight.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            {knight.name}
                          </label>
                        </div>)}
                    </div>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allSelected = selectedKnights.length === allKnights.length;
                          setSelectedKnights(allSelected ? [] : allKnights.map(k => k.id));
                        }}
                      >
                        {selectedKnights.length === allKnights.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveKnightSelection}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>}
            </div>
            <div className="flex flex-wrap gap-2">
              {userKnights.map(userKnight => <TooltipProvider key={userKnight.id}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className={`relative cursor-pointer transition-opacity hover:opacity-100 ${userKnight.is_used ? 'opacity-40' : 'opacity-100'}`} onClick={() => canManage && toggleKnightUsage(userKnight.id, userKnight.is_used)}>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={userKnight.knights.image_url || '/placeholder.svg'} alt={userKnight.knights.name} />
                          <AvatarFallback>{userKnight.knights.name[0]}</AvatarFallback>
                        </Avatar>
                        {userKnight.is_used && <div className="absolute -top-1 -right-1 bg-accent text-background rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{userKnight.knights.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>)}
            </div>
            
            {canManage && <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" onClick={resetAllKnights} className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                  Resetar
                </Button>
                <span className="text-sm text-muted-foreground">
                  {userKnights.filter(uk => !uk.is_used).length} disponíveis
                </span>
              </div>}
          </section>

          {/* Minhas Batalhas */}
          <section className="mb-6 bg-card p-4 rounded-2xl ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground font-semibold leading-none mb-4 lg:mb-1">Minhas <span className="text-accent">Batalhas</span></h2>
              <Badge variant="secondary" className="font-light text-nowrap ">{userBattles.length} batalhas</Badge>
            </div>
            
            {userBattles.length === 0 ? <div className="text-center py-8">
                <p className="text-muted-foreground text-base mb-8">
                  Este usuário ainda não cadastrou batalhas
                </p>
              </div> : <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {paginatedBattles.map(battle => <UserBattleCard key={battle.id} battle={battle} knights={allKnights} stigmas={stigmas} onDelete={fetchUserBattles} hideAuthor={true} />)}
                </div>
                {totalBattlePages > 1 && <div className="flex justify-center gap-2">
                    {Array.from({
                length: totalBattlePages
              }, (_, i) => i + 1).map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)}>
                        {page}
                      </Button>)}
                  </div>}
              </>}
          </section>

          {/* Meus Comentários */}
          <section className="mb-12 bg-card p-4 rounded-2xl ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold leading-none mb-4 lg:mb-1">Meus <span className="text-accent">Comentários</span></h2>
              <Badge variant="secondary" className="font-light text-nowrap ">{userComments.length} comentários</Badge>
            </div>
            
            {userComments.length === 0 ? <div className="text-center py-8">
                <p className="text-muted-foreground text-base mb-8">
                  Este usuário ainda não fez comentários
                </p>
              </div> : <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {paginatedComments.map(comment => <Card key={comment.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-accent mb-2">
                            {format(new Date(comment.created_at), "dd/MM/yy", {
                        locale: ptBR
                      })}
                          </p>
                          <p className="text-sm text-foreground mb-4">{comment.content}</p>
                          <Button size="sm" variant="outline" onClick={() => window.location.href = `/battles/${comment.battle_id}`} className="-mb-6">
                            Ver Batalha
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
                {totalCommentPages > 1 && <div className="flex justify-center gap-2">
                    {Array.from({
                length: totalCommentPages
              }, (_, i) => i + 1).map(page => <Button key={page} variant={commentsPage === page ? "default" : "outline"} size="sm" onClick={() => setCommentsPage(page)}>
                        {page}
                      </Button>)}
                  </div>}
              </>}
          </section>
        </main>
        
        <FavoriteKnightModal isOpen={isFavoriteModalOpen} onClose={() => setIsFavoriteModalOpen(false)} userId={targetUserId} currentFavoriteId={userProfile?.favorite_knight_id} onUpdate={fetchUserProfile} />
      </div>
    </>;
};
export default Members;