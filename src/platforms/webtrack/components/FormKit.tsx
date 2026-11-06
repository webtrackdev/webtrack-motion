// Piezas de formulario con los tokens reales de la app, compartidas por los videos de
// funcionalidad: etiqueta, campo con lista, menu de opciones y boton.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/** Resalte verde "recien confirmado" (0..1) para un borde de campo. */
export const glowStyle = (glow: number, open = false): CSSProperties => ({
  borderColor: glow > 0.01 ? `color-mix(in srgb, #22c55e ${Math.round(glow * 100)}%, var(--input))` : open ? 'var(--primary)' : undefined,
  boxShadow:
    glow > 0.01
      ? `0 0 0 ${3 * glow}px rgba(34,197,94,${0.28 * glow})`
      : open
        ? '0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)'
        : undefined
});

export const Label: FC<{ children: ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="form-label">
    {children}
    {required && <span style={{ color: 'var(--destructive)' }}>&nbsp;*</span>}
  </label>
);

const control: CSSProperties = {
  height: 'var(--app-control-h)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 12px',
  border: '1px solid var(--input)',
  borderRadius: 'var(--radius-control)',
  background: 'var(--card)',
  fontSize: 13
};

export const SelectField: FC<{
  value: string;
  placeholder?: string;
  anchor?: string;
  open?: boolean;
  glow?: number;
  children?: ReactNode;
}> = ({ value, placeholder, anchor, open, glow = 0, children }) => (
  <div style={{ position: 'relative' }}>
    <div
      data-anchor={anchor}
      style={{ ...control, color: value ? 'var(--foreground)' : 'var(--placeholder)', ...glowStyle(glow, open) }}
    >
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{value || placeholder}</span>
      <ChevronDown size={15} style={{ color: 'var(--chevron)' }} />
    </div>
    {children}
  </div>
);

export const TextField: FC<{ value: string; anchor?: string; glow?: number }> = ({ value, anchor, glow = 0 }) => (
  <div data-anchor={anchor} style={{ ...control, color: 'var(--foreground)', ...glowStyle(glow) }}>
    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{value}</span>
  </div>
);

export const Menu: FC<{ open: number; options: string[]; prefix: string; hover: number | null; selected?: string }> = ({
  open,
  options,
  prefix,
  hover,
  selected
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 'calc(100% + 4px)',
      padding: 4,
      borderRadius: 10,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--elevation-overlay)',
      zIndex: 30,
      opacity: open,
      transform: `translateY(${(1 - open) * -6}px)`,
      visibility: open > 0.01 ? 'visible' : 'hidden'
    }}
  >
    {options.map((o, i) => (
      <div
        key={o}
        data-anchor={`${prefix}-${i}`}
        style={{
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          borderRadius: 7,
          fontSize: 13,
          fontWeight: selected === o ? 700 : 500,
          color: 'var(--foreground)',
          background: hover === i ? 'var(--primary-tint)' : 'transparent'
        }}
      >
        {o}
        {selected === o && <Check size={14} style={{ color: 'var(--primary)' }} />}
      </div>
    ))}
  </div>
);

export const Btn: FC<{
  children: ReactNode;
  variant?: 'primary' | 'outline';
  anchor?: string;
  press?: number;
  height?: number;
  minWidth?: number;
}> = ({ children, variant = 'primary', anchor, press = 0, height, minWidth }) => (
  <button
    type="button"
    data-anchor={anchor}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: height ?? 'var(--app-control-h)',
      minWidth,
      padding: '0 20px',
      borderRadius: 'var(--radius-control)',
      border: variant === 'primary' ? 'none' : '1px solid var(--primary)',
      background: variant === 'primary' ? 'var(--primary)' : 'var(--card)',
      color: variant === 'primary' ? 'var(--primary-foreground)' : 'var(--primary)',
      fontSize: 13,
      fontWeight: 700,
      transform: `scale(${1 - 0.06 * press})`
    }}
  >
    {children}
  </button>
);
