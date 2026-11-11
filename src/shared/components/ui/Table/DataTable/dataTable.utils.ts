import type { ExportFormat } from "./dataTable.types";

/* Ported from hims-ui-new lib/export.ts + lib/csv.ts */

export const EXPORT_FORMATS: { value: ExportFormat; label: string; description: string }[] = [
    { value: "csv", label: "CSV", description: "Plain text, opens anywhere" },
    { value: "excel", label: "Excel (.xls)", description: "Opens in Excel with formatting" },
    { value: "pdf", label: "PDF", description: 'Opens the print dialog — choose "Save as PDF"' },
];

/** Sort comparator: numbers, dates and text (natural order, case-insensitive); empty values last. */
export const compareValues = (a: unknown, b: unknown): number => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

export const newId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `v${Date.now()}${Math.random().toString(16).slice(2)}`;

/** Page numbers to show, with "…" gaps: 1 … 4 5 6 … 20 */
export const pageWindow = (page: number, pages: number): (number | "…")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const out: (number | "…")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    if (start > 2) out.push("…");
    for (let i = start; i <= end; i++) out.push(i);
    if (end < pages - 1) out.push("…");
    out.push(pages);
    return out;
};

const text = (v: unknown): string => {
    if (v == null) return "";
    if (v instanceof Date) return v.toLocaleDateString();
    return String(v);
};

/** Formula-injection guard for spreadsheet apps. */
const safeCell = (v: unknown): string => {
    const s = text(v);
    return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

const csvCell = (v: unknown): string => {
    const s = safeCell(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const html = (v: unknown): string =>
    safeCell(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const downloadFile = (filename: string, content: string, mime = "text/csv;charset=utf-8") => {
    // BOM so Excel opens UTF-8 (Hindi / Odia text) correctly.
    const blob = new Blob(["﻿", content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const STYLE = `body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;margin:16px}
h1{font-size:15px;margin:0 0 4px}p{margin:0 0 12px;color:#555}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top}
th{background:#fff7ed}tr:nth-child(even) td{background:#fffaf3}`;

export interface ExportOptions {
    format: ExportFormat;
    filename: string;
    title: string;
    headers: string[];
    rows: unknown[][];
}

/** Client-side export: CSV, an Excel-compatible HTML table, or a print-to-PDF view. */
export const exportTable = ({ format, filename, title, headers, rows }: ExportOptions) => {
    if (format === "csv") {
        const lines = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
        downloadFile(`${filename}.csv`, lines.join("\r\n"));
        return;
    }

    const table = `<table><thead><tr>${headers.map((h) => `<th>${html(h)}</th>`).join("")}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${html(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table>`;
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${html(title)}</title><style>${STYLE}</style></head><body><h1>${html(title)}</h1><p>${rows.length} records · exported ${new Date().toLocaleString()}</p>${table}</body></html>`;

    if (format === "excel") {
        downloadFile(`${filename}.xls`, doc, "application/vnd.ms-excel;charset=utf-8");
        return;
    }

    // PDF: print a clean copy from a hidden iframe so the user can choose "Save as PDF".
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(frame);
    const w = frame.contentWindow;
    if (!w) {
        frame.remove();
        return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    w.onafterprint = () => frame.remove();
    window.setTimeout(() => {
        w.focus();
        w.print();
        window.setTimeout(() => frame.remove(), 60_000);
    }, 150);
};
