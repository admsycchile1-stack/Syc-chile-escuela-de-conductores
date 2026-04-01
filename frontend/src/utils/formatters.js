export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date + 'T00:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatRut = (rut) => {
  if (!rut) return '';
  // Remove dots and dashes
  const clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  let formatted = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formatted = body[i] + formatted;
    count++;
    if (count === 3 && i !== 0) {
      formatted = '.' + formatted;
      count = 0;
    }
  }
  return `${formatted}-${dv}`;
};

const normalizeNumberString = (value) => {
  if (value === null || value === undefined || value === '') return '';

  const raw = String(value).trim();

  // Valores que vienen desde MySQL como "150000.00"
  if (/^\d+[.,]\d{2}$/.test(raw)) {
    return String(Math.round(Number(raw.replace(',', '.'))));
  }

  return raw.replace(/\D/g, '');
};

export const formatNumberInput = (value) => {
  if (!value) return '';
  const clean = normalizeNumberString(value);
  if (!clean) return '';
  return new Intl.NumberFormat('es-CL').format(clean);
};

export const parseNumberInput = (value) => {
  if (!value) return '';
  return normalizeNumberString(value);
};

export const formatDecimalInput = (value) => {
  if (value === null || value === undefined || value === '') return '';

  const normalized = String(value)
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1');

  if (!normalized) return '';

  const [integerPart, decimalPart] = normalized.split('.');
  const formattedInteger = integerPart ? new Intl.NumberFormat('es-CL').format(integerPart) : '0';

  if (decimalPart === undefined) return formattedInteger;

  return `${formattedInteger},${decimalPart.slice(0, 2)}`;
};

export const parseDecimalInput = (value) => {
  if (value === null || value === undefined || value === '') return '';

  const normalized = String(value)
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1');

  return normalized;
};
