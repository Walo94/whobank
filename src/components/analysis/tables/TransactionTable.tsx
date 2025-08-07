import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Componentes de tabla básicos (reemplaza con tu implementación de tabla)
const Table = ({ children, ...props }: any) => <table {...props} className="w-full caption-bottom text-sm">{children}</table>;
const TableHeader = ({ children, ...props }: any) => <thead {...props} className="[&_tr]:border-b">{children}</thead>;
const TableBody = ({ children, ...props }: any) => <tbody {...props} className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow = ({ children, className = "", ...props }: any) => <tr {...props} className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
const TableHead = ({ children, className = "", ...props }: any) => <th {...props} className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
const TableCell = ({ children, className = "", ...props }: any) => <td {...props} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Badge component
const Badge = ({ children, variant = "default", className = "" }: any) => {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantStyle = variant === "secondary"
    ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
    : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";

  return <div className={`${baseStyle} ${variantStyle} ${className}`}>{children}</div>;
};
import {
  Download,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Save,
  AlertTriangle
} from "lucide-react";
import { useState, useMemo } from "react";
import { exportToExcel } from '../../../services/api';
import { AccountData } from "@/types/analysis"; // Importar el tipo

// Tipo de transacción (ajusta según tu tipo real)
interface Transaction {
  fecha: string;
  descripcion: string;
  retiro: number;
  deposito: number;
  saldo: number | null;
  categoria?: string;
  codigo?: string;
  tipo_movimiento?: string;
}

// Función de ayuda
const formatCurrency = (value: number | null | undefined, showZero: boolean = false) => {
  if (value === null || value === undefined) return "";
  if (!showZero && value === 0) return "";
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const TransactionTable = ({
  transactions: initialTransactions,
  onTransactionsChange,
  account // <-- AÑADIR PROP 'account'
}: {
  transactions: Transaction[];
  onTransactionsChange?: (transactions: Transaction[]) => void;
  account: AccountData; // <-- DEFINIR TIPO DE LA PROP
}) => {
  // FIX: Guardar una copia inmutable de las transacciones originales al iniciar.
  // Se usa una función en useState para asegurar que solo se ejecute en el primer render.
  const [originalTransactions] = useState<Transaction[]>(() => JSON.parse(JSON.stringify(initialTransactions)));

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  // FIX: Cambiar el ordenamiento por defecto para mantener el orden original
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({ key: "", direction: "original" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [editedTransactions, setEditedTransactions] = useState<Set<number>>(new Set());
  const [showOnlyEdited, setShowOnlyEdited] = useState(false);

  // Función para mover monto de retiro a depósito
  const moveToDeposit = (index: number) => {
    const actualIndex = getActualIndex(index);
    const newTransactions = [...transactions];
    const transaction = newTransactions[actualIndex];

    if (transaction.retiro > 0) {
      transaction.deposito = transaction.retiro;
      transaction.retiro = 0;
      transaction.tipo_movimiento = "ingreso";

      setTransactions(newTransactions);
      setEditedTransactions(prev => new Set(prev).add(actualIndex));
      onTransactionsChange?.(newTransactions);
    }
  };

  // Función para mover monto de depósito a retiro
  const moveToWithdrawal = (index: number) => {
    const actualIndex = getActualIndex(index);
    const newTransactions = [...transactions];
    const transaction = newTransactions[actualIndex];

    if (transaction.deposito > 0) {
      transaction.retiro = transaction.deposito;
      transaction.deposito = 0;
      transaction.tipo_movimiento = "gasto";

      setTransactions(newTransactions);
      setEditedTransactions(prev => new Set(prev).add(actualIndex));
      onTransactionsChange?.(newTransactions);
    }
  };

  // Función para restaurar transacción original (CORREGIDA)
  const resetTransaction = (index: number) => {
    const actualIndex = getActualIndex(index);
    if (actualIndex === -1) return; // Salvaguarda por si no se encuentra el índice

    const newTransactions = [...transactions];
    // FIX: Se usa la copia original 'originalTransactions' para obtener el valor real.
    const originalTransaction = originalTransactions[actualIndex];

    // Se reemplaza la transacción modificada con la original
    newTransactions[actualIndex] = { ...originalTransaction };
    setTransactions(newTransactions);

    // Se elimina el índice del set de transacciones editadas
    const newEditedSet = new Set(editedTransactions);
    newEditedSet.delete(actualIndex);
    setEditedTransactions(newEditedSet);
    onTransactionsChange?.(newTransactions);
  };

  // Función auxiliar para obtener el índice real de la transacción
  const getActualIndex = (displayIndex: number) => {
    if (displayIndex >= paginatedTransactions.length || displayIndex < 0) return -1;
    const transaction = paginatedTransactions[displayIndex];
    // Este método de búsqueda puede ser frágil si hay transacciones duplicadas exactas.
    // Una mejor alternativa sería usar `transactions.indexOf(transaction)` si las referencias de objeto se mantienen.
    return transactions.findIndex(t =>
      t.fecha === transaction.fecha &&
      t.descripcion === transaction.descripcion &&
      t.saldo === transaction.saldo
    );
  };

  // Función para exportar con cambios usando la API existente
  const expor = () => {
    // Preparar datos en el formato esperado por la API
    const dataForExport = transactions.map((transaction, index) => ({
      fecha: transaction.fecha,
      descripcion: transaction.descripcion,
      categoria: transaction.categoria || 'Sin categoría',
      tipo_movimiento: transaction.tipo_movimiento || (transaction.deposito > 0 ? 'ingreso' : 'gasto'),
      deposito: transaction.deposito || 0,
      retiro: transaction.retiro || 0,
      saldo: transaction.saldo || 0,
      codigo: transaction.codigo || '',
      modificado: editedTransactions.has(index) // Indicar si fue modificada
    }));

    // Preparar los datos del resumen
    const summaryData = {
        saldoAnterior: account.saldo_anterior_resumen ?? 0,
        totalDepositos: account.total_ingresos ?? 0,
        totalCargos: account.total_gastos ?? 0,
        saldoActual: account.saldo_actual_resumen ?? 0,
    };

    const filename = `Estado_de_cuenta_${new Date().toISOString().split('T')[0]}`;

    try {
      // Llamar a exportToExcel con los datos de las transacciones Y el resumen
      exportToExcel(dataForExport, filename, summaryData);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar el archivo Excel. Por favor, intenta nuevamente.');
    }
  };

  // FIX: Función para determinar el orden correcto de transacciones
  const getCorrectTransactionOrder = (transactionsList: Transaction[]) => {
    // Separar saldo anterior de otras transacciones
    const saldoAnterior = transactionsList.filter(t => 
      t.tipo_movimiento === "saldo_anterior" || 
      t.descripcion.toUpperCase().includes("SALDO ANTERIOR")
    );
    
    const otrasTransacciones = transactionsList.filter(t => 
      t.tipo_movimiento !== "saldo_anterior" && 
      !t.descripcion.toUpperCase().includes("SALDO ANTERIOR")
    );

    // Ordenar otras transacciones por fecha si es necesario
    const monthMap: { [key: string]: number } = {
      ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5,
      JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11
    };

    if (sortConfig.key === 'fecha' && sortConfig.direction !== 'original') {
      otrasTransacciones.sort((a, b) => {
        const [dayA, monthA] = a.fecha.split(' ');
        const [dayB, monthB] = b.fecha.split(' ');
        const dateA = new Date(2025, monthMap[monthA?.toUpperCase()] ?? 0, parseInt(dayA)).getTime();
        const dateB = new Date(2025, monthMap[monthB?.toUpperCase()] ?? 0, parseInt(dayB)).getTime();
        
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    // Siempre devolver saldo anterior primero
    return [...saldoAnterior, ...otrasTransacciones];
  };

  const sortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar solo editadas si está activado
    if (showOnlyEdited) {
      filtered = filtered.filter((_, index) => editedTransactions.has(index));
    }

    // FIX: Aplicar el orden correcto respetando saldo anterior
    return getCorrectTransactionOrder(filtered);
  }, [transactions, searchTerm, sortConfig, showOnlyEdited, editedTransactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedTransactions, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedTransactions.length / rowsPerPage);

  const handleSort = (key: string) => {
    if (key !== "fecha") return; // Solo permitir ordenamiento por fecha
    setSortConfig(prev => {
      if (prev.key === key) {
        // Ciclar: asc -> desc -> original
        const directions = ["asc", "desc", "original"];
        const currentIndex = directions.indexOf(prev.direction);
        const nextDirection = directions[(currentIndex + 1) % directions.length];
        return { key: nextDirection === "original" ? "" : key, direction: nextDirection };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Detalle de Movimientos
              {editedTransactions.size > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {editedTransactions.size} editadas
                </Badge>
              )}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant={showOnlyEdited ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyEdited(!showOnlyEdited)}
            >
              {showOnlyEdited ? "Ver Todas" : "Solo Editadas"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={expor}
              className="bg-green-50 hover:bg-green-300 text-green-700 border-green-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2 text-sm text-blue-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Corrección Manual:</strong> Usa las flechas para mover montos entre columnas.
              Los cambios se marcarán en naranja y podrás exportar el resultado corregido a Excel.
              <br />
              <strong>Nota:</strong> El saldo anterior siempre aparece primero para mantener el orden cronológico correcto.
            </div>
          </div>
        </div>

        {/* Contenedor con scroll horizontal mejorado */}
        <div className="w-full overflow-x-auto border rounded-md">
          <Table className="min-w-[1000px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("fecha")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Fecha
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                  {sortConfig.key === "fecha" && (
                    <span className="ml-1 text-xs">
                      ({sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "original"})
                    </span>
                  )}
                </TableHead>
                <TableHead className="min-w-[300px]">Concepto</TableHead>
                <TableHead className="text-right min-w-[120px]">
                  Retiros
                </TableHead>
                <TableHead className="text-center min-w-[140px]">Acciones</TableHead>
                <TableHead className="text-right min-w-[120px]">
                  Depósitos
                </TableHead>
                <TableHead className="text-right min-w-[120px]">
                  Saldo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction, index) => {
                const actualIndex = getActualIndex(index);
                const isEdited = editedTransactions.has(actualIndex);
                const isSaldoAnterior = transaction.tipo_movimiento === "saldo_anterior" || 
                                      transaction.descripcion.toUpperCase().includes("SALDO ANTERIOR");

                return (
                  <TableRow
                    key={`${transaction.fecha}-${transaction.descripcion}-${index}`}
                    className={`${isEdited ? "bg-orange-50 border-l-4 border-l-orange-400" : ""} ${isSaldoAnterior ? "bg-blue-50 border-l-4 border-l-blue-400" : ""}`}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {transaction.fecha}
                        {isEdited && (
                          <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                            Editada
                          </Badge>
                        )}
                        {isSaldoAnterior && (
                          <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                            Inicial
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        {transaction.descripcion}
                        {transaction.codigo && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Código: {transaction.codigo}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className={`font-medium whitespace-nowrap ${transaction.retiro > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                        {formatCurrency(transaction.retiro)}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Mover de retiro a depósito */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-100"
                          onClick={() => moveToDeposit(index)}
                          disabled={transaction.retiro === 0 || isSaldoAnterior}
                          title="Mover a Depósitos"
                        >
                          <ArrowRight className="w-4 h-4 text-green-600" />
                        </Button>

                        {/* Mover de depósito a retiro */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          onClick={() => moveToWithdrawal(index)}
                          disabled={transaction.deposito === 0 || isSaldoAnterior}
                          title="Mover a Retiros"
                        >
                          <ArrowLeft className="w-4 h-4 text-red-600" />
                        </Button>

                        {/* Resetear si fue editada */}
                        {isEdited && !isSaldoAnterior && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => resetTransaction(index)}
                            title="Restaurar Original"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className={`font-medium whitespace-nowrap ${transaction.deposito > 0 ? 'text-green-600' : 'text-gray-400'
                        }`}>
                        {formatCurrency(transaction.deposito)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(transaction.saldo, true)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Controles de paginación */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4">
          <div className="text-sm text-muted-foreground">
            Total de {sortedTransactions.length} transacciones
            {editedTransactions.size > 0 && (
              <span className="ml-2 text-orange-600">
                ({editedTransactions.size} modificadas)
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Filas:</p>
              <Select
                value={`${rowsPerPage}`}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={rowsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  {[20, 50, 100].map(size => (
                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;