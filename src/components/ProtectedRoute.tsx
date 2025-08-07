import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

// Este componente recibe como 'children' la página que queremos proteger.
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Mientras se verifica la sesión, mostramos un mensaje de carga.
  // Esto es CRUCIAL para evitar redirigir al usuario antes de tiempo.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // 2. Si la carga terminó y NO hay usuario, lo redirigimos a la página de login.
  if (!user) {
    // Usamos el componente <Navigate> de react-router-dom para la redirección.
    // 'replace' evita que el usuario pueda volver a la página protegida con el botón de "atrás".
    // 'state={{ from: location }}' guarda la página que intentaba visitar, para poder redirigirlo de vuelta allí después del login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si la carga terminó y SÍ hay un usuario, mostramos la página solicitada.
  return <>{children}</>;
};

export default ProtectedRoute;