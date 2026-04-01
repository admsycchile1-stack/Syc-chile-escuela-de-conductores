import { formatCurrency } from './formatters';

const createWorksheetSection = (title, headers, rows) => {
  const headerHtml = headers.map((header) => `<th>${header}</th>`).join('');
  const rowsHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`)
    .join('');

  return `
    <table>
      <tr><th colspan="${headers.length}" class="section-title">${title}</th></tr>
      <tr>${headerHtml}</tr>
      ${rowsHtml || `<tr><td colspan="${headers.length}">Sin datos</td></tr>`}
    </table>
  `;
};

export const exportFinancialReportToExcel = ({ year, resumenMensual = [], egresosPorCategoria = [] }) => {
  const totalIngresos = resumenMensual.reduce((sum, item) => sum + Number(item.ingresos || 0), 0);
  const totalEgresos = resumenMensual.reduce((sum, item) => sum + Number(item.egresos || 0), 0);
  const balance = totalIngresos - totalEgresos;

  const resumenGeneral = createWorksheetSection(
    `Resumen Financiero ${year}`,
    ['Concepto', 'Monto'],
    [
      ['Total Ingresos', formatCurrency(totalIngresos)],
      ['Total Egresos', formatCurrency(totalEgresos)],
      ['Balance', formatCurrency(balance)],
      ['Generado', new Date().toLocaleString('es-CL')],
    ]
  );

  const resumenMensualTable = createWorksheetSection(
    'Detalle Mensual',
    ['Mes', 'Ingresos', 'Egresos', 'Balance'],
    resumenMensual.map((item) => [
      item.nombre,
      formatCurrency(item.ingresos),
      formatCurrency(item.egresos),
      formatCurrency(item.balance),
    ])
  );

  const categoriasTable = createWorksheetSection(
    'Egresos por Categoria',
    ['Categoria', 'Total'],
    egresosPorCategoria.map((item) => [item.categoria, formatCurrency(item.total)])
  );

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; margin-bottom: 24px; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #e2e8f0; }
          .section-title { background: #c7d2fe; font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        ${resumenGeneral}
        ${resumenMensualTable}
        ${categoriasTable}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-financiero-${year}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportFuelReportToExcel = ({
  fechaDesde,
  fechaHasta,
  fecha_desde,
  fecha_hasta,
  patente,
  registros = [],
}) => {
  const normalizedFechaDesde = fecha_desde || fechaDesde || '';
  const normalizedFechaHasta = fecha_hasta || fechaHasta || '';
  const totalLitros = registros.reduce((sum, item) => sum + Number(item.litros || 0), 0);
  const totalPrecio = registros.reduce((sum, item) => sum + Number(item.precio_cargado || 0), 0);
  const totalKilometros = registros.reduce((sum, item) => sum + Number(item.kilometros_recorridos || 0), 0);
  const rendimientoPromedio = totalLitros > 0 ? totalKilometros / totalLitros : 0;
  const costoPromedioPorKm = totalKilometros > 0 ? totalPrecio / totalKilometros : 0;

  const resumenGeneral = createWorksheetSection(
    'Reporte de Combustible',
    ['Concepto', 'Valor'],
    [
      ['Patente', patente || 'Todas'],
      ['Fecha desde', normalizedFechaDesde || '-'],
      ['Fecha hasta', normalizedFechaHasta || '-'],
      ['Total litros', totalLitros.toFixed(2)],
      ['Total cargado', formatCurrency(totalPrecio)],
      ['Total kilometros', new Intl.NumberFormat('es-CL').format(totalKilometros)],
      ['Rendimiento promedio (km/l)', rendimientoPromedio.toFixed(2)],
      ['Costo promedio por km', formatCurrency(costoPromedioPorKm)],
      ['Generado', new Date().toLocaleString('es-CL')],
    ]
  );

  const detalle = createWorksheetSection(
    'Detalle diario',
    ['Fecha', 'Patente', 'Litros', 'Precio cargado', 'Km recorridos', 'Rendimiento km/l', 'Costo por km'],
    registros.map((item) => [
      item.fecha || '',
      item.patente || '',
      Number(item.litros || 0).toFixed(2),
      formatCurrency(item.precio_cargado || 0),
      new Intl.NumberFormat('es-CL').format(item.kilometros_recorridos || 0),
      Number(item.rendimiento_km_litro || 0).toFixed(2),
      formatCurrency(item.costo_por_km || 0),
    ])
  );

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; margin-bottom: 24px; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #e2e8f0; }
          .section-title { background: #bfdbfe; font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        ${resumenGeneral}
        ${detalle}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-combustible-${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
