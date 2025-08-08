import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import { getHistory } from "@/services/api";
import { FileText, Clock, RotateCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import Swal from 'sweetalert2';

// Definimos un tipo para los items del historial
interface HistoryItem {
    file_name: string;
    created_at: string;
}

const UserPanel = () => {
    // 1. OBTENEMOS DATOS FIABLES DEL CONTEXTO
    // 'user' y 'profile' son gestionados por AuthContext
    const { user, profile: userProfile } = useAuth();
    const location = useLocation();

    // 2. ESTADOS LOCALES PARA DATOS ESPECÍFICOS DE ESTA PÁGINA
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [tokens, setTokens] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');

    // Función de carga simplificada
    const fetchData = useCallback(async () => {
        // Si no hay un usuario identificado por el contexto, no hacemos nada.
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Cargar en paralelo el perfil actualizado y el historial
            const [profileResponse, historyResponse] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('daily_conversions_count, conversion_tokens')
                    .eq('id', user.id)
                    .single(),
                getHistory()
            ]);

            // Procesar el perfil para obtener los tokens
            const { data: profileData, error: profileError } = profileResponse;
            if (profileError) throw profileError;
            if (profileData) {
                setTokens(profileData.conversion_tokens - profileData.daily_conversions_count);
            }

            // Procesar el historial
            setHistory(historyResponse);

        } catch (err: any) {
            console.error("Falló la carga de datos del panel:", err.message);
            setError("No se pudo cargar la información. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [user]); // La dependencia principal es el 'user' del contexto

    // useEffect para cargar los datos cuando el componente se monta,
    // o cuando el usuario o la ubicación cambian.
    useEffect(() => {
        fetchData();
    }, [fetchData, location]);

    const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Caso 1: Validación de longitud (con SweetAlert) ---
    if (newPassword.length < 6) {
        Swal.fire({
            icon: 'warning',
            title: 'Contraseña muy corta',
            text: 'La nueva contraseña debe tener al menos 6 caracteres.',
        });
        return;
    }

    // Llamada a Supabase para actualizar al usuario
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        // --- Caso 2: Error al actualizar (con SweetAlert) ---
        Swal.fire({
            icon: 'error',
            title: 'Error al Actualizar',
            text: `No se pudo cambiar la contraseña: ${error.message}`,
        });
    } else {
        // --- Caso 3: Éxito (con SweetAlert que se cierra solo) ---
        Swal.fire({
            icon: 'success',
            title: '¡Contraseña Actualizada!',
            text: 'Tu contraseña ha sido cambiada exitosamente.',
            timer: 2000, // La alerta se cerrará automáticamente después de 2000ms (2 segundos)
            showConfirmButton: false, // Oculta el botón "OK"
            timerProgressBar: true, // Muestra una barra de progreso del temporizador
        });
        setNewPassword(''); // Limpia el campo de texto después del éxito
    }
};

    const displayPlanName = userProfile?.plan_activo ? (userProfile.plan_activo === 'gratis' ? 'Free' : userProfile.plan_activo.charAt(0).toUpperCase() + userProfile.plan_activo.slice(1)) : "";

    // --- VISTAS DE CARGA Y ERROR ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                    <div className="text-center">
                        <RotateCw className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                        <p className="text-lg text-muted-foreground">Cargando información...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-destructive text-lg mb-4">{error}</p>
                        <Button onClick={fetchData}>
                            <RotateCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA PRINCIPAL CON LOS DATOS CARGADOS ---
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Panel de Usuario</CardTitle>
                        <CardDescription>Gestiona la información de tu cuenta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Correo Electrónico</h3>
                                <p>{user?.email}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Conversiones Diarias Disponibles</h3>
                                    <p className="text-2xl font-bold text-primary">
                                        {tokens !== null ? tokens : "..."}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Plan Actual</h3>
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl font-bold">{displayPlanName}</p>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-t pt-8">
                            <h3 className="font-semibold text-lg">Documentos Recientes</h3>
                            {history.length > 0 ? (
                                <ul className="space-y-3">
                                    {history.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-primary" />
                                                <span className="font-medium">{item.file_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span>{new Date(item.created_at).toLocaleString()}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No has procesado ningún documento todavía.</p>
                            )}
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4 border-t pt-8">
                            <h3 className="font-semibold text-lg">Cambiar Contraseña</h3>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit">
                                Actualizar Contraseña
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserPanel;