import type { TabId } from '../store/useStore';

export interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

interface Props {
  items: NavItem[];
  active: TabId;
  onSelect: (id: TabId) => void;
}

/** Barra flotante tipo Despegar: píldora blanca sobre el contenido, con el ítem
 *  activo marcado por un fondo redondeado detrás del ícono. */
export default function BottomNav({ items, active, onSelect }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3">
      <div className="pointer-events-auto mx-auto max-w-md rounded-[28px] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60 flex">
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              aria-current={on ? 'page' : undefined}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition active:scale-95"
            >
              <span
                className={`grid place-items-center h-8 w-12 rounded-2xl transition ${
                  on ? 'bg-accent-400/15 text-accent-300' : 'text-slate-500'
                }`}
              >
                <i className={`fa-solid ${it.icon} text-base`} />
              </span>
              <span
                className={`text-[10px] leading-none font-semibold ${
                  on ? 'text-accent-300' : 'text-slate-500'
                }`}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
