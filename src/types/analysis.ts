// /types/analysis.ts o similar

// Interfaz para una transacción individual (sin cambios)
export interface Transaction {
  fecha: string;
  descripcion: string;
  retiro: number;
  deposito: number;
  saldo: number | null;
}

// Interfaz para UNA SOLA cuenta, aplicable a ambos bancos.
// Corresponde a `CuentaAnalisis` en tu backend de Pydantic.
export interface AccountData {
  // Campos de BanBajío (opcionales para Banamex)
  nombre_cuenta?: string;
  numero_cuenta?: string;
  moneda?: string;
  saldo_anterior_resumen?: number;
  saldo_actual_resumen?: number;

  // Campos comunes (en Banamex, estos vendrían del resumen_periodo)
  total_ingresos: number;
  total_gastos: number;

  // Lista de transacciones de esta cuenta
  transacciones: Transaction[];
}

// Interfaz principal para la respuesta del API.
export interface AnalysisResponse {
  banco: 'banamex' | 'banbajio' | string;
  nombre_archivo: string;
  fecha_corte: string | null;
  periodo: string | null;
  cuentas: AccountData[]; // Siempre un arreglo
}