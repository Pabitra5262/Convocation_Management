import { saveAs } from 'file-saver';

/** Format date as DD/MM/YYYY HH:MM:SS */
const formatDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/** Helper to identify action columns */
const isActionColumn = (col: any): boolean => {
  const key = col.accessorKey ?? col.id ?? '';
  const header = String(col.header || '').toLowerCase();
  return key === 'action' || key === 'mrt-row-actions' || header.includes('action') || header.includes('view');
};

/** Helper to identify Serial Number columns */
const isSiNoColumn = (col: any): boolean => {
  const key = col.accessorKey ?? col.id ?? '';
  const header = String(col.header || '').toLowerCase();
  return key === 'sino' || key === 'slno' || header.includes('si no') || header.includes('sl no') || header.includes('s.no');
};

/**
 * Export table data to PDF — A4 portrait, TDCCOL logo, title, date & time.
 * Usage:
 *   onExportPDF={(rows) => exportToPDF(columns, rows, 'staff-list', 'Staff List')}
 */
export const exportToPDF = async (
  columns: any[],
  rows: any[],
  fileName: string = 'table-data',
  title?: string,
) => {
  // Dynamically import heavy PDF generation libraries on demand
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  // A4 portrait: 210 × 297 mm
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const now       = new Date();

  // ── Title (center) ────────────────────────────────────────
  const displayTitle = title ?? fileName;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(36, 92, 145);
  doc.text(displayTitle, pageWidth / 2, 16, { align: 'center' });

  // ── Date & Time (top-right) ───────────────────────────────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${formatDateTime(now)}`, pageWidth - 10, 10, { align: 'right' });

  // ── Divider ───────────────────────────────────────────────
  doc.setDrawColor(36, 92, 145);
  doc.setLineWidth(0.5);
  doc.line(10, 26, pageWidth - 10, 26);

  // ── Table ─────────────────────────────────────────────────
  const exportColumns = columns.filter(col => !isActionColumn(col));

  const tableHeaders = exportColumns.map(col => col.header ?? col.id ?? '');
  const tableData    = rows.map((row, index) =>
    exportColumns.map(col => {
      if (isSiNoColumn(col)) {
        return String(index + 1);
      }
      const key = col.accessorKey ?? col.id;
      const value = row.original ? row.original[key] : row[key];
      return value !== undefined && value !== null ? String(value) : '';
    }),
  );

  autoTable(doc, {
    head:               [tableHeaders],
    body:               tableData,
    startY:             30,
    styles:             { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles:         { fillColor: [36, 92, 145], textColor: 255, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    margin:             { left: 10, right: 10 },
    tableWidth:         'auto',
  });

  const safeDate = formatDateTime(now).replace(/[/: ]/g, '-');
  doc.save(`${fileName}_${safeDate}.pdf`);
};

/**
 * Export table data to Excel (.xlsx).
 * Usage:
 *   onExportExcel={(rows) => exportToExcel(columns, rows, 'staff-list')}
 */
export const exportToExcel = async (
  columns: any[],
  rows: any[],
  fileName: string = 'table-data',
  sheetName: string = 'Data',
) => {
  // Dynamically import heavy Excel generation library on demand
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const exportColumns = columns.filter(col => !isActionColumn(col));

  worksheet.columns = exportColumns.map(col => {
    const key = col.accessorKey ?? col.id ?? (isSiNoColumn(col) ? 'sino' : '');
    return {
      header: col.header ?? col.id ?? '',
      key: key,
      width: isSiNoColumn(col) ? 10 : 22,
    };
  });

  rows.forEach((row, index) => {
    const rowData = row.original ?? row;
    const mappedRow: Record<string, any> = {};
    
    exportColumns.forEach(col => {
      const key = col.accessorKey ?? col.id ?? (isSiNoColumn(col) ? 'sino' : '');
      if (isSiNoColumn(col)) {
        mappedRow[key] = index + 1;
      } else {
        mappedRow[key] = rowData[col.accessorKey ?? col.id];
      }
    });
    worksheet.addRow(mappedRow);
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF245C91' }, // #245C91
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${fileName}_${Date.now()}.xlsx`);
};
