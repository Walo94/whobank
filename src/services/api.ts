import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Procesa un archivo PDF subido por el usuario.
 * @param file - El archivo PDF a procesar.
 * @returns La respuesta JSON del análisis de la API.
 */

export const processPdf = async (file: File) => {
  // FormData es la forma estándar de enviar archivos en peticiones HTTP.
  const formData = new FormData();
  formData.append("archivo", file);

  // 1. Obtener la sesión actual del usuario desde Supabase
  const { data: { session } } = await supabase.auth.getSession();

  // 2. INICIALIZAR LAS CABECERAS (AQUÍ ESTÁ LA CORRECCIÓN)
  const headers: HeadersInit = {};

  // 3. Si hay una sesión activa, AÑADIR EL TOKEN a la cabecera de la petición
  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  

  try {
    // 3. Actualizar la URL del endpoint y añadir las cabeceras a la petición
    const response = await fetch(`${API_URL}/analysis/process-pdf`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      // Si la respuesta no es 2xx, lanzamos un error para que sea capturado por el .catch()
      const errorData = await response.json();
      throw {
        status: response.status,
        message: errorData.detail || "Ocurrió un error en el servidor"
      };
    }

    // Si todo está bien, devolvemos los datos en formato JSON.
    return await response.json();

  } catch (error) {
    console.error("Error al procesar el PDF:", error);
    throw error;
  }
};


/**
 * Exporta un array de datos de transacciones a un archivo Excel.
 * @param transactions - El array de transacciones a exportar.
 * @param fileName - El nombre del archivo sin la extensión.
 * @param summaryData - Datos opcionales del resumen para incluir como encabezado.
 */
export const exportToExcel = (
  transactions: any[], 
  fileName: string,
  summaryData?: {
    saldoAnterior: number;
    totalDepositos: number;
    totalCargos: number;
    saldoActual: number;
  }
) => {
  // 1. Preparamos los datos de las transacciones para la exportación.
  const dataToExport = transactions.map(t => ({
    'Fecha': t.fecha,
    'Descripción': t.descripcion,
    'Categoría': t.categoria || 'Sin Categoría',
    'Tipo de Movimiento': t.tipo_movimiento,
    'Ingreso ($)': t.deposito,
    'Gasto ($)': t.retiro,
    'Saldo ($)': t.saldo
  }));

  // 2. Creamos una nueva hoja de cálculo.
  const workbook = XLSX.utils.book_new();
  let worksheet: XLSX.WorkSheet;

  // 3. Si hay datos de resumen, los añadimos primero.
  if (summaryData) {
    const summaryRows = [
      ["Saldo Anterior", summaryData.saldoAnterior],
      ["(+) Depósitos", summaryData.totalDepositos],
      ["(-) Cargos", summaryData.totalCargos],
      ["Saldo Actual", summaryData.saldoActual],
      [], // Fila vacía para separar el resumen de la tabla
    ];
    // Creamos la hoja a partir de los datos del resumen.
    worksheet = XLSX.utils.aoa_to_sheet(summaryRows);
    
    // Añadimos la tabla de transacciones debajo del resumen.
    // 'origin: -1' indica que se debe añadir al final de los datos existentes.
    XLSX.utils.sheet_add_json(worksheet, dataToExport, { origin: -1, skipHeader: false });
  } else {
    // Si no hay resumen, creamos la hoja solo con las transacciones.
    worksheet = XLSX.utils.json_to_sheet(dataToExport);
  }

  // 4. Ajustamos el ancho de las columnas para una mejor visualización.
  worksheet['!cols'] = [
    { wch: 20 }, // Saldo/Depositos etc (Ancho para la primera columna del resumen)
    { wch: 15 }, // Montos del resumen
    { wch: 80 }, // Descripción (columna más ancha de la tabla)
    { wch: 25 }, // Categoría
    { wch: 20 }, // Tipo de Movimiento
    { wch: 15 }, // Ingreso
    { wch: 15 }, // Gasto
    { wch: 15 }, // Saldo
    { wch: 10 }, // Modificado
  ];
  // Reajuste del ancho de las primeras columnas si hay resumen.
  if (summaryData) {
      worksheet['!cols'][0] = { wch: 20 };
      worksheet['!cols'][1] = { wch: 15 };
  } else {
      // Si no hay resumen, las columnas de la tabla empiezan desde el principio.
      worksheet['!cols'] = [
        { wch: 10 }, { wch: 80 }, { wch: 25 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
      ];
  }

  // 5. Añadimos la hoja de cálculo al libro.
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transacciones");

  // 6. Generamos y descargamos el archivo Excel.
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Obtiene el historial de análisis para el usuario autenticado.
 */
export const getHistory = async () => {
  // 1. OBTENEMOS LA SESIÓN UNA ÚNICA VEZ AQUÍ
  // El componente que llama se asegurará de que la sesión sea válida.
  const { data: { session } } = await supabase.auth.getSession();

  // Si no hay sesión, lanzamos un error claro.
  if (!session) {
    throw new Error("Sesión no encontrada. No se puede obtener el historial.");
  }

  // 2. CONSTRUIMOS LAS CABECERAS
  const headers: HeadersInit = {
    'Authorization': `Bearer ${session.access_token}`,
  };

  // 3. HACEMOS LA PETICIÓN
  try {
    const response = await fetch(`${API_URL}/analysis/history`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al cargar el historial.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getHistory:", error);
    throw error;
  }
};

/**
 * Exporta elementos del DOM a un archivo PDF.
 * @param elementIds - Un array de IDs de los elementos HTML a exportar.
 * @param fileName - El nombre del archivo PDF sin la extensión.
 * @param period - El texto del periodo para usarlo como subtítulo.
 */
export const exportChartsToPdf = async (elementIds: string[], fileName: string, period: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4'); // Crea un nuevo PDF en orientación vertical, mm y tamaño A4
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 15; // Margen en mm
  let currentY = margin;

  // --- AÑADIR TÍTULO Y SUBTÍTULO AL PDF ---
  pdf.setFontSize(18);
  pdf.text('Resumen del Análisis', margin, currentY);
  currentY += 8;
  pdf.setFontSize(11);
  pdf.setTextColor(100); // Color gris para el subtítulo
  pdf.text(`Periodo: ${period}`, margin, currentY);
  currentY += 10;

  for (const id of elementIds) {
    const element = document.getElementById(id);
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // --- 2. LÓGICA PARA EVITAR EL ESPACIO GRANDE ---
      // Si la imagen no cabe en la página actual, crea una nueva.
      if (currentY + imgHeight > pdfHeight - margin) {
        pdf.addPage();
        currentY = margin; // Reiniciar la posición en la nueva página
      }

      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10; // Mover la posición para el siguiente elemento
    }
  }

  pdf.save(`${fileName}.pdf`); // Descarga el PDF
};

/**
 * Obtiene TODOS los datos para el panel de usuario en una sola llamada.
 */
export const getUserPanelData = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Sesión no encontrada.");
  }

  const headers: HeadersInit = {
    'Authorization': `Bearer ${session.access_token}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // LLAMAMOS AL NUEVO ENDPOINT
    const response = await fetch(`${API_URL}/user/panel-data`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al cargar los datos del panel.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getUserPanelData:", error);
    throw error;
  }
};