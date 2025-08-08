import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const {
    signOut
  } = useAuth();
  const navigation = [{
    name: "Home",
    href: "/"
  }, {
    name: "Cadastrar",
    href: "/create-battle"
  }, {
    name: "Batalhas",
    href: "/battles"
  }, {
    name: "Cavaleiros",
    href: "/knights"
  }];
  const isActive = (path: string) => {
    if (path === "/battles") {
      return location.pathname === path || location.pathname.startsWith("/battles/");
    }
    return location.pathname === path;
  };
  return <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-accent">ラ Oblivium</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map(item => <Link key={item.name} to={item.href}>
                <Button variant={isActive(item.href) ? "secondary" : "ghost"} className={isActive(item.href) ? "bg-accent/10 text-accent" : "text-foreground hover:text-black hover:bg-accent"}>
                  {item.name}
                </Button>
              </Link>)}
            <Button variant="ghost" onClick={signOut} className="text-foreground hover:text-black hover:bg-accent">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigation.map(item => <Link key={item.name} to={item.href} onClick={() => setIsMenuOpen(false)}>
                  <Button variant={isActive(item.href) ? "secondary" : "ghost"} className={`w-full justify-start ${isActive(item.href) ? "bg-accent/10 text-accent" : "text-foreground hover:text-black hover:bg-accent"}`}>
                    {item.name}
                  </Button>
                </Link>)}
              <Button variant="ghost" onClick={() => {
            setIsMenuOpen(false);
            signOut();
          }} className="w-full justify-start hover:bg-gradient-cosmic hover:text-white text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;