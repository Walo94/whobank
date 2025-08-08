import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Crown, LogOut, Menu, X } from "lucide-react";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar el menú móvil

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo con indicador Beta */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="text-5xl font-bold tracking-tighter">
            {/* Se quita el efecto de pulso de las letras */}
            <span className="text-primary">W</span>
            <span className="text-secondary">h</span>
            <span className="text-accent">o</span>
            <span className="text-success">B</span>
            <span className="text-warning">a</span>
            <span className="text-destructive">n</span>
            <span className="text-primary">k</span>
          </Link>
          {/* Indicador Beta con la animación */}
          <span 
            className="ml-3 bg-primary/20 text-primary text-sm font-semibold px-3 py-1 rounded-full animate-pulse"
          >
            Beta
          </span>
        </div>

        {/* --- Menú de Hamburguesa para Móviles --- */}
        <div className="md:hidden">
          <Button onClick={toggleMenu} variant="ghost" size="icon">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            <span className="sr-only">Abrir menú</span>
          </Button>
        </div>

        {/* --- Navegación de Escritorio (oculta en móvil) --- */}
        <nav className="hidden md:flex items-center space-x-2 md:space-x-4">
          {user ? (
            <>
              {profile && profile.plan_activo !== 'gratis' && (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
              <Link to="/user-panel" className="text-sm font-medium text-muted-foreground hover:text-primary">
                {user.email}
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              {/* Opción de Contacto agregada */}
              <Link to="/contact">
                <Button variant="ghost" size="sm">Contacto</Button>
              </Link>
              <Link to="/register">
                <Button variant="ghost" size="sm">Registro</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="sm">Iniciar Sesión</Button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* --- Menú Desplegable Móvil --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {user ? (
              // Vista para usuario logueado en móvil
              <>
                <Link to="/user-panel" onClick={toggleMenu} className="flex items-center space-x-2 text-md font-medium text-muted-foreground hover:text-primary">
                  {profile && profile.plan_activo !== 'gratis' && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                  <span>{user.email}</span>
                </Link>
                <Button onClick={() => { handleLogout(); toggleMenu(); }} variant="outline" size="sm" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              // Vista para invitado en móvil
              <>
                {/* Opción de Contacto agregada para móvil */}
                <Link to="/contact" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">Contacto</Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">Registro</Button>
                </Link>
                <Link to="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full justify-start">Iniciar Sesión</Button>
                </Link>
                <Link to="/plans" onClick={toggleMenu}>
                  <Button variant="secondary" className="w-full justify-start">Planes</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;