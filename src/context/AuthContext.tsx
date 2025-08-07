// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  plan_activo: string;
  // aquí puedes añadir más campos del perfil, como 'daily_conversions_count'
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- Lógica Mejorada ---
    const setData = async (session: Session | null) => {
      if (session?.user) {
        // Establecer datos del usuario
        setUser(session.user);
        setSession(session);

        // Cargar el perfil del usuario si existe
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('plan_activo') // Puedes añadir más campos aquí si los necesitas globalmente
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error al cargar el perfil de usuario:", error);
          setProfile(null);
        } else {
          setProfile(userProfile);
        }
      } else {
        // Limpiar todo si no hay sesión
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
    };

    // 1. OBTENER LA SESIÓN INICIAL AL CARGAR LA APP
    supabase.auth.getSession().then(({ data: { session } }) => {
      setData(session);
    });

    // 2. ESCUCHAR CAMBIOS DE ESTADO (LOGIN, LOGOUT, TOKEN REFRESH)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // No necesitamos volver a cargar el perfil en cada refresco de token,
        // solo cuando la sesión realmente cambia (login/logout).
        // setSession y setUser son suficientes para la mayoría de los eventos.
        setSession(session);
        setUser(session?.user ?? null);
        // El perfil se mantiene a menos que el usuario cambie.
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, profile, loading, signOut };

  // No renderizar nada hasta que la sesión inicial se haya verificado
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};