import { ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('Carregando...');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setDisplayName('Carregando...');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    setUserProfile(data);
    setDisplayName(data?.full_name || 'Usuário');
  };

  const handleProfileClick = () => {
    if (user) {
      const idPrefix = user.id.substring(0, 3);
      const slugName = userProfile?.full_name ? 
        userProfile.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : 
        'usuario';
      navigate(`/members/${idPrefix}-${slugName}`, { state: { userId: user.id } });
    }
  };

  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:text-black hover:bg-accent">
          <span className="truncate max-w-32">{displayName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border-border">
        <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2 cursor-pointer hover:bg-muted">
          <User className="h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={signOut} 
          className="flex items-center gap-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;