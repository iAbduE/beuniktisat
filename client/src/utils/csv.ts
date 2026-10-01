// Basit, bağımlılıksız CSV dışa aktarma yardımcısı.
// Türkçe karakterlerin Excel'de bozulmaması için başa UTF-8 BOM eklenir.

type Row = Record<string, unknown>;

const escapeCell = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value);
  // Tırnak, virgül, noktalı virgül veya satır sonu varsa tırnak içine al
  if (/["\n;,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Verilen satırları CSV olarak indirir.
 * @param rows   Dışa aktarılacak nesne dizisi
 * @param columns  { key, label } sütun tanımları (sıra ve başlıklar)
 * @param fileName  Uzantısız dosya adı
 */
export const exportToCsv = (
  rows: Row[],
  columns: { key: string; label: string }[],
  fileName: string
): void => {
  // Excel'in Türkçe locale'inde ayraç olarak noktalı virgül beklenir
  const separator = ';';
  const header = columns.map((c) => escapeCell(c.label)).join(separator);
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(separator))
    .join('\r\n');

  const csv = '﻿' + header + '\r\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `${fileName}-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
