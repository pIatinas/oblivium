import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        // Check if user is active
        const {
          data: profile
        } = await supabase.from('profiles').select('active, role').eq('user_id', session.user.id).single();
        if (profile?.active) {
          navigate('/');
        } else {
          await supabase.auth.signOut();
          toast({
            title: "Conta inativa",
            description: "Sua conta ainda não foi ativada. Entre em contato com um administrador.",
            variant: "destructive"
          });
        }
      }
    };
    checkAuth();
  }, [navigate, toast]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });
        if (error) throw error;
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email e aguarde a ativação da sua conta por um administrador."
        });
      } else {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        // Check if user is active after login
        const {
          data: profile
        } = await supabase.from('profiles').select('active, role').eq('user_id', data.user.id).single();
        if (!profile?.active) {
          await supabase.auth.signOut();
          toast({
            title: "Conta inativa",
            description: "Sua conta ainda não foi ativada. Entre em contato com um administrador.",
            variant: "destructive"
          });
          return;
        }
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!"
        });

        // Redirect to the original page or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, {
          replace: true
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-nebula flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm border-none lg:bg-transparent">
        <CardHeader className="text-center space-y-4">
          <div className="text-6xl">⚔️</div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">Oblivium</CardTitle>
            <CardDescription className="text-muted-foreground -mt-3">Guerra dos Tronos</CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isSignUp && <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Nome</Label>
                <Input id="fullName" type="text" placeholder="Seu nome completo" value={fullName} onChange={e => setFullName(e.target.value)} required className="bg-background/50 border-border" />
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-background/50 border-border" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required className="bg-background/50 border-border pr-10" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-cosmic text-white hover:opacity-90" disabled={loading}>
              {loading ? "Carregando..." : isSignUp ? "Cadastrar" : "Entrar"}
            </Button>
            
            <Button type="button" variant="ghost" onClick={() => setIsSignUp(!isSignUp)} className="w-full hover:bg-transparent text-yellow-100 hover:text-white font-extralight text-xs">
              {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Cadastre-se"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>;
};
export default Auth;