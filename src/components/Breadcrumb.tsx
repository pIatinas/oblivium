import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumb = () => {
  const location = useLocation();
  
  const breadcrumbMap: { [key: string]: string } = {
    '/': 'Home',
    '/knights': 'Cavaleiros',
    '/battles': 'Batalhas',
    '/create-battle': 'Cadastrar Batalha'
  };
  
  const currentPage = breadcrumbMap[location.pathname] || 'Home';
  
  if (location.pathname === '/') {
    return null; // Don't show breadcrumb on home page
  }
  
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link 
        to="/" 
        className="hover:text-accent transition-colors"
      >
        Home
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-foreground">{currentPage}</span>
    </nav>
  );
};

export default Breadcrumb;