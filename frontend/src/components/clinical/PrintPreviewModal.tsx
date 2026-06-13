import { ReactNode, useRef } from 'react';
import { Button } from '../ui/Button';

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
    win.document.write(`
      <!DOCTYPE html>
      <html><head><title>${title}</title>
      <style>
        body { font-family: Georgia, serif; padding: 24px; color: #111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #555; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
        .sig { margin-top: 48px; border-top: 1px solid #999; width: 240px; padding-top: 8px; font-size: 12px; }
      </style></head><body>${content.innerHTML}</body></html>
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
        <div ref={printRef}>{children}</div>
      </div>
    </div>
  );
}
