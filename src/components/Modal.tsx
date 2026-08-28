import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

/** Modal a pantalla completa en mobile, centrado en desktop.
 *  Cierra con Escape y con click en el backdrop. */
export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 border border-slate-800 w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-800 shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-white truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
