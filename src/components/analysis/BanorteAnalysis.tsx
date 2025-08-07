import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Globe } from "lucide-react";
import { AnalysisResponse } from "@/types/analysis";
import BanorteSummary from "./summaries/BanorteSummary";
import TransactionTable from "./tables/TransactionTable";

interface BanorteAnalysisProps {
  data: AnalysisResponse;
}

const BanorteAnalysis = ({ data }: BanorteAnalysisProps) => {
  return (
    <div className="flex flex-col gap-12">
      {data.cuentas.map((account, index) => (
        <Card key={index} className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-4">
              <Wallet className="w-8 h-8 text-primary" />
              {account.nombre_cuenta}
            </CardTitle>
            <div className="text-muted-foreground flex items-center gap-4 mt-2">
              <span>#{account.numero_cuenta}</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Moneda: <strong>{account.moneda}</strong></span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            {/* Llama al componente de resumen modularizado */}
            <BanorteSummary account={account} />

            {/* Llama al componente de tabla modularizado */}
            <TransactionTable transactions={account.transacciones} account={account} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BanorteAnalysis;