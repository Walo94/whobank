import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { AccountData } from "@/types/analysis";

// Función de ayuda
const formatCurrency = (value: number | null | undefined, showZero: boolean = false) => {
    if (value === null || value === undefined) return "";
    if (!showZero && value === 0) return "";
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface BanamexSummaryProps {
    account: AccountData;
    //fechaCorte: string | null;
}

const BanamexSummary = ({ account }: BanamexSummaryProps) => {
    //const finalStatementBalance = account.transacciones.length > 0 ? account.transacciones[account.transacciones.length - 1].saldo : null;
    //const totalIncome = account.total_ingresos;
    //const totalExpenses = account.total_gastos;

    return (
        <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-card">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Saldo Anterior</CardTitle></CardHeader>
                <CardContent><div className="flex items-center"><Scale className="w-5 h-5 text-muted-foreground mr-2" /><span className="text-2xl font-bold">{formatCurrency(account.saldo_anterior_resumen, true)}</span></div></CardContent>
            </Card>
            <Card className="shadow-card">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">(+) Depósitos</CardTitle></CardHeader>
                <CardContent><div className="flex items-center"><TrendingUp className="w-5 h-5 text-success mr-2" /><span className="text-2xl font-bold text-success">{formatCurrency(account.total_ingresos, true)}</span></div></CardContent>
            </Card>
            <Card className="shadow-card">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">(-) Cargos</CardTitle></CardHeader>
                <CardContent><div className="flex items-center"><TrendingDown className="w-5 h-5 text-destructive mr-2" /><span className="text-2xl font-bold text-destructive">{formatCurrency(account.total_gastos, true)}</span></div></CardContent>
            </Card>
            <Card className="shadow-card">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Saldo Actual</CardTitle></CardHeader>
                <CardContent><div className="flex items-center"><Scale className="w-5 h-5 text-primary mr-2" /><span className="text-2xl font-bold text-primary">{formatCurrency(account.saldo_actual_resumen, true)}</span></div></CardContent>
            </Card>
        </div>
    );
};

export default BanamexSummary;