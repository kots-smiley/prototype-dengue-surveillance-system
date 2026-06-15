import { ReactNode, useRef } from 'react';
import { Button } from '../ui/Button';
import { PRINT_DOCUMENT_CSS } from './print-styles';

interface PrintPreviewModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function PrintPreviewModal({ isOpen, title, onClose, children }: PrintPreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    const baseHref = `${window.location.origin}/`;
    win.document.write(`
      <!DOCTYPE html>
      <html><head>
        <title>${title}</title>
        <base href="${baseHref}">
        <meta charset="utf-8">
        <meta name="color-scheme" content="light">
        <style>${PRINT_DOCUMENT_CSS}</style>
      </head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>Print</Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <div ref={printRef} className="rounded-lg border border-slate-200 bg-white p-4 text-slate-900">
          <style>{PRINT_DOCUMENT_CSS}</style>
          {children}
        </div>
      </div>
    </div>
  );
}
