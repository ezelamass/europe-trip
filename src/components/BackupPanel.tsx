import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';

/** Export / import del estado. Es la única red contra la pérdida de datos:
 *  todo vive en el localStorage del celular, que se puede limpiar sin aviso. */
export default function BackupPanel() {
  const exportState = useStore((s) => s.exportState);
  const importState = useStore((s) => s.importState);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const download = () => {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viajes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: 'Respaldo descargado.' });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = importState(await file.text());
    setMsg(
      res.ok
        ? { ok: true, text: 'Respaldo restaurado.' }
        : { ok: false, text: res.error ?? 'No se pudo restaurar.' },
    );
    e.target.value = '';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-slate-200">Respaldo</h3>
      <p className="text-xs text-slate-400 mt-1">
        Todo se guarda en este dispositivo. Si limpiás los datos del navegador, se pierde:
        bajá un respaldo de vez en cuando.
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={download}
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-2 transition"
        >
          <i className="fa-solid fa-download mr-1.5" />
          Exportar
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-2 transition"
        >
          <i className="fa-solid fa-upload mr-1.5" />
          Importar
        </button>
        <input ref={fileRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
      </div>
      {msg && (
        <p className={`text-xs mt-2 ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
          <i className={`fa-solid ${msg.ok ? 'fa-circle-check' : 'fa-circle-exclamation'} mr-1.5`} />
          {msg.text}
        </p>
      )}
    </div>
  );
}
