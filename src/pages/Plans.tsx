import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Header from "@/components/Header";

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(false);

   const plans = [
    {
      name: "Personal",
      monthlyPrice: 99,
      monthlyDocs: 15,
      features: [
        "Hasta 15 documentos por mes", // Énfasis en el límite
        "Exportación a Excel (.xlsx)", // Función principal
        "Análisis y categorización de movimientos", // Beneficio estándar
      ],
    },
    {
      name: "Profesional",
      monthlyPrice: 200,
      monthlyDocs: 40,
      features: [
        "Hasta 40 documentos por mes",
        "Exportación a Excel (.xlsx)",
        "Análisis y categorización de movimientos",
      ],
      popular: true,
    },
    {
      name: "Business",
      monthlyPrice: 500,
      monthlyDocs: 100,
      features: [
        "Hasta 100 documentos por mes",
        "Exportación a Excel (.xlsx)",
        "Análisis y categorización de movimientos",
        "Soporte prioritario", // Diferenciador clave
        "Acceso a API", // Diferenciador clave
      ],
    },
  ];

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.6); // 40% discount
  };

  const getAnnualDocs = (monthlyDocs: number) => {
    return monthlyDocs * 12;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planes para Cada Necesidad</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Más conversiones, más poder. Elige el volumen de documentos que necesitas.
          </p>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
              Mensual
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative h-6 w-11 rounded-full p-0"
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary transition-transform ${
                isAnnual ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </Button>
            <span className={`font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
              Anual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                Ahorra 40%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Más Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    MXN {isAnnual ? getAnnualPrice(plan.monthlyPrice) : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{isAnnual ? 'año' : 'mes'}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {isAnnual ? getAnnualDocs(plan.monthlyDocs) : plan.monthlyDocs} documentos 
                  {isAnnual ? ' por año' : ' por mes'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  Comenzar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            ¿Necesitas más documentos? <Button variant="link" className="p-0 h-auto">Contáctanos</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plans;