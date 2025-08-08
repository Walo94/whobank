import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Plans from "@/pages/Plans";
import UserPanel from "@/pages/UserPanel";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import ProtectedRoute from "@/components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Rutas Públicas (Cualquiera puede verlas) --- */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element = {<Contact />} />
      

      {/* --- Rutas Protegidas --- */}
      {/* Envolvemos el componente UserPanel con nuestro ProtectedRoute */}
      <Route
        path="/user-panel"
        element={
          <ProtectedRoute> {/* <-- 2. APLICA LA PROTECCIÓN */}
            <UserPanel />
          </ProtectedRoute>
        }
      />

      {/* La ruta catch-all siempre al final */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;