import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Trophy, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  favorite_knight_id: string | null;
}
interface Knight {
  id: string;
  name: string;
  image_url: string;
}
interface MemberStats {
  knights: number;
  battles: number;
  comments: number;
}
const MembersPage = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [knights, setKnights] = useState<Knight[]>([]);
  const [memberStats, setMemberStats] = useState<{
    [key: string]: MemberStats;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchMembers();
    fetchKnights();
  }, []);
  const fetchKnights = async () => {
    try {
      const {
        data
      } = await supabase.from('knights').select('*');
      setKnights(data || []);
    } catch (error) {
      console.error('Erro ao carregar cavaleiros:', error);
    }
  };
  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Only select basic profile info - email is restricted by RLS for non-admins
      const {
        data: profiles
      } = await supabase.from('profiles').select('id, user_id, full_name, avatar_url, favorite_knight_id, knights!favorite_knight_id(*)').order('full_name');
      if (profiles) {
        setMembers(profiles);

        // Fetch stats for each member
        const stats: {
          [key: string]: MemberStats;
        } = {};
        for (const profile of profiles) {
          // Count knights
          const {
            count: knightsCount
          } = await supabase.from('user_knights').select('*', {
            count: 'exact',
            head: true
          }).eq('user_id', profile.user_id);

          // Count battles
          const {
            count: battlesCount
          } = await supabase.from('battles').select('*', {
            count: 'exact',
            head: true
          }).eq('created_by', profile.user_id);

          // Count comments
          const {
            count: commentsCount
          } = await supabase.from('battle_comments').select('*', {
            count: 'exact',
            head: true
          }).eq('user_id', profile.user_id);
          stats[profile.user_id] = {
            knights: knightsCount || 0,
            battles: battlesCount || 0,
            comments: commentsCount || 0
          };
        }
        setMemberStats(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
  };
  const createMemberSlug = (userId: string, name: string) => {
    const idPrefix = userId.substring(0, 3);
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : 'usuario';
    return `${idPrefix}-${slug}`;
  };
  const handleMemberClick = (member: Profile) => {
    const slug = createMemberSlug(member.user_id, member.full_name || '');
    navigate(`/members/${slug}`, {
      state: {
        userId: member.user_id
      }
    });
  };
  const filteredMembers = members.filter(member => member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
  if (loading) {
    return <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>;
  }
  return <>
      <SEOHead title="Membros - Oblivium" description={`Conheça os ${members.length} membros da comunidade Oblivium`} />
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto p-6">
          <Breadcrumb />
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Membros</h1>
            <p className="text-muted-foreground text-center">
              Conheça todos os membros da comunidade
            </p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar membro..." className="pl-10 bg-card border-border" />
            </div>
          </div>

          {filteredMembers.length > 0 ? <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {filteredMembers.map(member => {
            const stats = memberStats[member.user_id] || {
              knights: 0,
              battles: 0,
              comments: 0
            };
            return <Card key={member.id} onClick={() => handleMemberClick(member)} className="bg-card hover:bg-card/80 transition-all duration-300 cursor-pointer border-none">
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-24 mx-auto mb-4 ">
                        <AvatarImage src={member.favorite_knight_id ? knights.find(k => k.id === member.favorite_knight_id)?.image_url || '/placeholder.svg' : '/placeholder.svg'} alt={member.full_name || 'Usuário'} />
                        <AvatarFallback className="text-xl">
                          {member.full_name ? member.full_name[0].toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        {member.full_name || 'Usuário'}
                      </h3>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">{stats.knights}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">{stats.battles}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">{stats.comments}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
          })}
            </div> : <div className="text-center py-12">
              <p className="text-muted-foreground text-xl">
                Nenhum membro encontrado
              </p>
            </div>}
        </div>
        <Footer />
      </div>
    </>;
};
export default MembersPage;