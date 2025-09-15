import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Battles from "./pages/Battles";
import BattleDetail from "./pages/BattleDetail";
import CreateBattle from "./pages/CreateBattle";
import Knights from "./pages/Knights";
import Members from "./pages/Members";
import MembersPage from "./pages/MembersPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/battles" element={<ProtectedRoute><Battles /></ProtectedRoute>} />
            <Route path="/battles/:battleUrl" element={<ProtectedRoute><BattleDetail /></ProtectedRoute>} />
            <Route path="/battles/:id" element={<ProtectedRoute><BattleDetail /></ProtectedRoute>} />
            <Route path="/create-battle" element={<ProtectedRoute><CreateBattle /></ProtectedRoute>} />
            <Route path="/knights" element={<ProtectedRoute><Knights /></ProtectedRoute>} />
            <Route path="/knight/:knightUrl" element={<ProtectedRoute><Knights /></ProtectedRoute>} />
            <Route path="/members/:slug" element={<ProtectedRoute><Members /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
