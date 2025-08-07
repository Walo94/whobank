import React from 'react';
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";

// 1. Importa los tipos y los nuevos componentes contenedores de cada banco
import { AnalysisResponse } from "@/types/analysis";
import BanamexAnalysis from "./analysis/BanamexAnalysis";
import BanbajioAnalysis from "./analysis/BanbajioAnalysis";
import BbvaAnalysis from './analysis/BbvaAnalysis';
import BanorteAnalysis from './analysis/BanorteAnalysis';

// --- PROPS DEL COMPONENTE ---
interface AnalysisResultsProps {
    data: AnalysisResponse;
    onNewAnalysis: () => void;
}

// --- COMPONENTE PRINCIPAL (CONTROLADOR) ---
const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, onNewAnalysis }) => {
  console.log(data);

  // Estado de carga o error si los datos no son válidos o están incompletos
  if (!data || !data.banco || !data.cuentas || data.cuentas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando resultados...</h2>
          <p className="text-muted-foreground">O los datos del análisis son inválidos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* --- ENCABEZADO --- */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Conversión Completado para {data.banco.toUpperCase()}
          </h1>
          <p className="text-lg text-muted-foreground">
            Resultados para el periodo: {data.periodo || 'Periodo no encontrado'}
          </p>
        </div>

        {/* --- BOTÓN DE ACCIÓN --- */}
        <div className="flex items-center gap-2 mb-8">
          <Button onClick={onNewAnalysis} className="bg-success hover:bg-success/90">
            <FilePlus className="w-4 h-4 mr-2" /> Analizar Otro Estado de Cuenta
          </Button>
        </div>

        {/* 2. RENDERIZADO CONDICIONAL
          Aquí es donde ocurre la magia. El componente delega toda la lógica de 
          presentación al componente específico de cada banco. 
        */}
        <div className="mt-8">
          {data.banco === 'banamex' && <BanamexAnalysis data={data} />}
          {data.banco === 'banbajio' && <BanbajioAnalysis data={data} />}
          {data.banco === 'bbva' && <BbvaAnalysis data={data} />}
          {data.banco === 'banorte' && <BanorteAnalysis data={data} />}
        </div>
        
      </div>
    </div>
  );
};

export default AnalysisResults;