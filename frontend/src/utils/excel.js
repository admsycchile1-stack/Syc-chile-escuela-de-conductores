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
