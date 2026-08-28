import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Estilos base compartidos. Estaban escritos a mano en ~17 lugares para tres
 *  tipos de botón y en 10 para los campos de formulario, y ya habían empezado a
 *  divergir: tres inputs habían perdido el anillo de foco al copiarse. */
const BUTTON_VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold',
  ghost: 'bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold',
  danger: 'bg-slate-800 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400',
} as const;

const BUTTON_SIZES = {
  sm: 'text-xs rounded-lg px-3 py-1.5',
  md: 'text-xs rounded-lg px-3 py-2',
  icon: 'w-7 h-7 rounded-lg text-xs grid place-items-center',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} transition active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

/** Para los `<a>` que se ven como botón fantasma (fotos, alojamiento): no pueden
 *  usar `<Button>` porque tienen que seguir siendo links. */
export const GHOST_LINK_CLS =
  'bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg px-3 py-2 transition';

export const INPUT_CLS =
  'bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 ' +
  'placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export const SELECT_CLS =
  'bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500';

/** El aviso ámbar de "dato útil" aparecía copiado byte a byte en tres tabs. */
export function TipCallout({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-amber-200/90 bg-amber-950/25 border border-amber-900/40 rounded-lg px-3 py-2">
      <i className="fa-solid fa-lightbulb mr-2 text-amber-400" />
      {children}
    </p>
  );
}
