export type WorkbookRow = {
  row: number;
  cells: Record<string, { v: string | number; f: string | null }>;
};

export type WorkbookSheet = {
  name: string;
  headers: Record<string, string | number>;
  rows: WorkbookRow[];
  notes?: (string | number)[][];
};

export type WorkbookValueKind = 'date' | 'percent' | 'text' | 'money';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const workbookDateString = (value: number) =>
  new Date((value - 25569) * 86400000).toISOString().slice(0, 10);

export const workbookDateSerial = (value: string) =>
  Math.round(Date.parse(`${value}T00:00:00Z`) / 86400000) + 25569;

export function workbookValueKind(sheet: WorkbookSheet, column: string): WorkbookValueKind {
  const heading = String(sheet.headers[column]).toLowerCase();
  if (heading.includes('date') || heading === 'date buying') return 'date';
  if (
    heading.includes('rate') ||
    heading.includes('percentage') ||
    heading.includes('ltv') ||
    heading.includes('annual return') ||
    sheet.headers[column] === 0.5
  ) return 'percent';
  return column === 'A' ? 'text' : 'money';
}

export function workbookLabel(sheet: WorkbookSheet, column: string) {
  return sheet.headers[column] === 0.5
    ? '50% of the annual return'
    : String(sheet.headers[column]).trim();
}

export function workbookDisplay(
  sheet: WorkbookSheet,
  column: string,
  value: string | number | null | undefined,
) {
  const kind = workbookValueKind(sheet, column);
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return 'Not provided';
  }
  if (kind === 'date') {
    if (typeof value === 'number') return workbookDateString(value);
    const normalized = value.trim();
    if (/^\d+(?:\.\d+)?$/.test(normalized)) return workbookDateString(Number(normalized));
    const parsed = Date.parse(normalized);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : 'Not provided';
  }
  if (typeof value === 'string') return value;
  return kind === 'percent' ? `${(value * 100).toFixed(2)}%` : currency.format(value);
}

export function workbookSheetLabel(name: string) {
  return name === 'Without Mo' ? 'Mohamed is adviser' : name;
}
