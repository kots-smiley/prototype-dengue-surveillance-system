/** Shared CSS injected into the print preview window (Tailwind is not available there). */
export const PRINT_DOCUMENT_CSS = `
  @page {
    size: A4 portrait;
    margin: 14mm 16mm;
  }

  * {
    box-sizing: border-box;
  }

  html {
    color-scheme: light;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #111827;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-doc {
    max-width: 100%;
  }

  .print-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid #0f766e;
    margin-bottom: 14px;
  }

  .print-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .print-org-name {
    margin: 0;
    font-size: 13pt;
    font-weight: 700;
    color: #0f766e;
    line-height: 1.2;
  }

  .print-org-location {
    margin: 2px 0 0;
    font-size: 9pt;
    color: #64748b;
  }

  .print-title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .print-title {
    margin: 0;
    font-size: 15pt;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #111827;
  }

  .print-meta {
    font-size: 9pt;
    color: #64748b;
    text-align: right;
    white-space: nowrap;
  }

  .print-section {
    margin-bottom: 12px;
  }

  .print-section-title {
    margin: 0 0 6px;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #475569;
  }

  .print-panel {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
    background: #f8fafc;
  }

  .print-grid {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 4px 10px;
    font-size: 10.5pt;
  }

  .print-label {
    font-weight: 600;
    color: #475569;
  }

  .print-value {
    color: #111827;
  }

  .print-body-text {
    margin: 0;
    font-size: 10.5pt;
    color: #111827;
    white-space: pre-wrap;
  }

  .print-signature {
    margin-top: 28px;
    padding-top: 10px;
    border-top: 1px solid #94a3b8;
    width: 260px;
    font-size: 9.5pt;
    color: #475569;
  }

  .print-signature-line {
    margin-top: 36px;
    border-bottom: 1px solid #111827;
    height: 1px;
  }

  table.print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10pt;
  }

  table.print-table th,
  table.print-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }

  table.print-table th {
    background: #f1f5f9;
    font-weight: 600;
    color: #334155;
  }
`;
