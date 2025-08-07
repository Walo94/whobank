import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, BarChart3, Shield, Download, FileText, UserPlus, Crown } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import AnalysisResults from "./AnalysisResults";
import { processPdf } from "@/services/api";
import Swal from 'sweetalert2';
import { useAuth } from "@/context/AuthContext";

type AnalysisData = any;

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: 'warning',
        title: 'Formato Incorrecto',
        text: 'Por favor, sube solo archivos PDF.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 100);

    try {
      const data = await processPdf(file);
      clearInterval(interval);
      setUploadProgress(100);
      setAnalysisData(data);
      setTimeout(() => setShowResults(true), 500);
    } catch (error: any) {
      clearInterval(interval);
      setIsUploading(false);

      // Extraer el mensaje de error correctamente
      let errorMessage = "Ocurrió un error inesperado. Por favor, intenta de nuevo.";
      let errorTitle = "Error al Procesar el Archivo";

      // Si es un objeto, pero no es nulo
      if (typeof errorMessage === 'object' && errorMessage !== null) {
        // TypeScript ahora sabe que es seguro acceder a sus propiedades
        errorMessage = (errorMessage as any).message || JSON.stringify(errorMessage);
      } else if (errorMessage === null) {
        // Maneja el caso explícito de que la API devuelva null
        errorMessage = "La API no devolvió un detalle del error.";
      }

      if (error?.status === 429) {
        errorTitle = 'Límite de Conversiones Excedido';
        Swal.fire({
          icon: 'warning',
          title: errorTitle,
          html: `
          <div>
            <p>${errorMessage}</p>
            <p class="mt-2 text-sm">Vuelve mañana o regístrate para más conversiones.</p>
          </div>
        `,
          timer: 4000,
          showConfirmButton: false,
          timerProgressBar: true,
          footer: '<a href="/plans" class="text-primary hover:underline">¿Necesitas más conversiones? ¡Conoce nuestros planes!</a>'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };
  const handleNewAnalysis = () => {
    setShowResults(false);
    setAnalysisData(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  if (showResults && analysisData) {
    return <AnalysisResults data={analysisData} onNewAnalysis={handleNewAnalysis} />;
  }

  return (
    // Se ajusta el padding vertical para mejor visualización en móviles
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section - Tipografía responsiva */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¡Transforma tus Estados de Cuenta!
          </h1>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Sube tu estado de cuenta en PDF y obtén una tabla de Excel limpia y organizada en segundos.
          </p>
        </div>

        {/* Upload Section */}
        <Card className={`mb-12 shadow-card border-2 border-dashed transition-all ${isDragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50'}`}>
          <CardContent className="p-6 md:p-12" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {isUploading ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <Upload className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Procesando tu archivo...</h3>
                <div className="max-w-md mx-auto mb-4">
                  <Progress value={uploadProgress} className="h-3" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {uploadProgress < 30 && "Leyendo el archivo PDF..."}
                  {uploadProgress >= 30 && uploadProgress < 60 && "Extrayendo transacciones..."}
                  {uploadProgress >= 60 && uploadProgress < 90 && "Categorizando gastos..."}
                  {uploadProgress >= 90 && "Generando análisis..."}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sube tu estado de cuenta</h3>
                <p className="text-muted-foreground mb-6">
                  Arrastra y suelta tu archivo PDF aquí, o{" "}
                  <button className="text-primary hover:underline font-medium" onClick={() => fileInputRef.current?.click()}>
                    haz clic para seleccionar
                  </button>
                </p>
                <p className="text-sm text-muted-foreground mb-6">Solo archivos PDF, máximo 10MB</p>
                <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => fileInputRef.current?.click()}>
                  Seleccionar archivo
                </Button>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid - Apilable en móvil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-shadow">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mb-4">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Análisis Automático</h3>
              <p className="text-muted-foreground text-sm">Categorización inteligente de gastos e ingresos</p>
            </CardContent>
          </Card>
          {/* Card 2 */}
          <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-shadow">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">100% Seguro</h3>
              <p className="text-muted-foreground text-sm">Tus datos se procesan localmente y nunca se almacenan</p>
            </CardContent>
          </Card>
          {/* Card 3 */}
          <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-shadow">
            <CardContent className="pt-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg mb-4">
                <Download className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Exporta Fácil</h3>
              <p className="text-muted-foreground text-sm">Descarga tus análisis en Excel con un solo clic</p>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Planes - Condicional y responsiva */}
        {(!user || (user && profile?.plan_activo === 'gratis')) && (
          <div className="mt-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Elige tu Acceso</h2>
            <p className="text-muted-foreground mb-8">Comienza gratis y mejora cuando lo necesites.</p>

            <div className={`grid grid-cols-1 gap-8 ${!user ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {/* VISTA PARA INVITADOS */}
              {!user && (
                <>
                  <Card className="text-center p-6 shadow-card border-2 border-border">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Prueba Anónima</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-grow">1 documento cada 24 horas sin registrarse.</p>
                      <div className="text-3xl font-bold text-foreground">Gratis</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center p-6 shadow-card border-2 border-border">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <UserPlus className="w-8 h-8 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Cuenta Gratuita</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-grow">3 documentos gratis cada 24 horas y guarda tu historial.</p>
                      <Link to="/register"><Button>Registrarse Gratis</Button></Link>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* VISTA PARA USUARIOS CON PLAN GRATUITO */}
              {user && profile?.plan_activo === 'gratis' && (
                <Card className="text-center p-6 shadow-card border-2 border-border">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Plan Actual: Free</h3>
                    <p className="text-muted-foreground text-sm mb-6 flex-grow">3 documentos cada 24 horas y acceso a tu historial.</p>
                    <div className="text-3xl font-bold text-foreground">Gratis</div>
                  </CardContent>
                </Card>
              )}

              {/* TARJETA PREMIUM (SE MUESTRA A AMBOS) */}
              <Card className="text-center p-6 shadow-card border-2 border-primary/50">
                <CardContent className="pt-6 flex flex-col h-full">
                  <Crown className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {user ? 'Hazte Premium' : 'Planes Premium'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-grow">Más conversiones, análisis avanzados y soporte prioritario.</p>
                  <Link to="/plans"><Button>Ver Planes</Button></Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;