// Replica de dos pantallas de reactive (solo lectura, PR reactive#1785):
//  1. PasswordPolicyEditor dentro de SlidingPanePasswordPolicy (Socio comercial > Política de
//     Contraseñas), con las clases y el JSX del componente real.
//  2. Usuarios > Creación Rápida de Usuarios con la contraseña manual (InputPasswordToggle) y
//     el aviso de getPasswordPolicyError.
// Textos del i18n real. Lo que el cursor toca esta montado desde el frame 0 para medir anclas.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, KeyRound, Plus, RotateCcw, Save } from 'lucide-react';
import '@webtrack/assets/css/vendor/sliding-pane.css';
import '@webtrack/views/components/FormActions/FormActions.css';
import './pane.css';
import { Label as FormLabel, SelectField, TextField } from '../../components/FormKit';

// ── Piezas de shadcn de reactive (mismas clases) ─────────────────────────────────────────

const Switch: FC<{ checked: boolean }> = ({ checked }) => (
  <button
    type="button"
    role="switch"
    data-slot="switch"
    data-size="default"
    data-state={checked ? 'checked' : 'unchecked'}
    className="peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
  >
    <span
      data-slot="switch-thumb"
      data-state={checked ? 'checked' : 'unchecked'}
      className="pointer-events-none block rounded-full bg-background ring-0 group-data-[size=default]/switch:size-4 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
    />
  </button>
);

const ghostIconSm =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 size-8";

const inputCls =
  'h-(--app-control-h) min-w-0 rounded-md border border-input bg-transparent px-3.5 py-1 text-sm outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-placeholder aria-invalid:border-destructive aria-invalid:ring-destructive/20';

const FormActionsFooter: FC<{ saveDisabled?: boolean; saving?: boolean; savePress?: number; frame?: number; saveAnchor?: string }> = ({
  saveDisabled,
  saving,
  savePress = 0,
  frame = 0,
  saveAnchor
}) => (
  <div className="form-actions form-actions--lg form-actions--footer">
    <button
      type="button"
      className="form-actions__save"
      data-anchor={saveAnchor}
      disabled={saveDisabled || saving}
      style={{ transform: `scale(${1 - 0.06 * savePress})`, minWidth: 100 }}
    >
      {saving ? (
        <span
          style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', transform: `rotate(${frame * 20}deg)` }}
        />
      ) : (
        <>
          <Save size={15} />
          Guardar
        </>
      )}
    </button>
    <button type="button" className="form-actions__cancel">
      Cancelar
    </button>
  </div>
);

/** SlidingPane de reactive con su estructura .slide-pane__* (entrada animada desde fuera). */
const Pane: FC<{ title: string; subtitle?: string; width: number; p: number; children: ReactNode; footer: ReactNode; className: string }> = ({
  title,
  subtitle,
  width,
  p,
  children,
  footer,
  className
}) => (
  <>
    <div className="slide-pane__overlay pp-overlay" style={{ backgroundColor: `rgba(0,0,0,${0.3 * p})` }} />
    <div
      className={`slide-pane slide-pane_from_right pp-pane ${className}`}
      style={{ width, transform: `translateX(${(1 - p) * (width + 40)}px)`, transition: 'none', zIndex: 1051 }}
    >
      <div className="slide-pane__header">
        <div className="slide-pane__title-wrapper">
          <div className="slide-pane__title">{title}</div>
          {subtitle ? <div className="slide-pane__subtitle">{subtitle}</div> : null}
        </div>
        <button type="button" className="slide-pane__close">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
      </div>
      <div className="slide-pane__content">{children}</div>
      {footer}
    </div>
  </>
);

// ── Pantalla 1: política de contraseñas ──────────────────────────────────────────────────

export type PolicyState = {
  frame: number;
  /** 0..1 entrada del panel. */
  pane: number;
  /** Valor visible de "Caracteres distintos mínimos". */
  unique: string;
  /** El nivel ya fijó este valor (hay override). */
  own: boolean;
  focus: boolean;
  saving: boolean;
  savePress: number;
};

export const MAX_UNIQUE_CHARS = 39;
const MIN_COUNT = 1;

type Rule = { key: string; label: string; kind: 'count' | 'switch'; value: number | boolean };
const COMPLEXITY: Rule[] = [
  { key: 'requiredLength', label: 'Longitud mínima', kind: 'count', value: 8 },
  { key: 'requiredUniqueChars', label: 'Caracteres distintos mínimos', kind: 'count', value: 2 },
  { key: 'requireDigit', label: 'Exigir al menos un número', kind: 'switch', value: true },
  { key: 'requireNonAlphanumeric', label: 'Exigir al menos un símbolo', kind: 'switch', value: true }
];
const BLOCKLIST: Rule[] = [
  { key: 'enableCommonList', label: 'Rechazar contraseñas comunes', kind: 'switch', value: true },
  { key: 'enableHibp', label: 'Rechazar contraseñas filtradas (Have I Been Pwned)', kind: 'switch', value: true },
  { key: 'rejectUserNameInPassword', label: 'Rechazar contraseñas que contengan el usuario o correo', kind: 'switch', value: true }
];

const isValidUnique = (raw: string) => {
  const n = raw === '' ? NaN : Number(raw);
  return Number.isInteger(n) && n >= MIN_COUNT && n <= MAX_UNIQUE_CHARS;
};

const RuleRow: FC<{ rule: Rule; s: PolicyState }> = ({ rule, s }) => {
  const isUnique = rule.key === 'requiredUniqueChars';
  const own = isUnique && s.own;
  const invalid = isUnique && own && !isValidUnique(s.unique);
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{rule.label}</div>
        {invalid ? (
          <div className="mt-0.5 text-xs text-destructive" data-anchor="range-error">
            Debe ser un número entero entre {MIN_COUNT} y {MAX_UNIQUE_CHARS}
          </div>
        ) : (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {own ? <span className="text-primary">Definido aquí</span> : 'Heredado de Sistema'}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {own && (
          <span className={ghostIconSm} style={{ color: 'var(--foreground)' }}>
            <RotateCcw />
          </span>
        )}
        {rule.kind === 'count' ? (
          <input
            data-slot="input"
            data-anchor={isUnique ? 'unique-input' : undefined}
            type="number"
            readOnly
            className={`${inputCls} w-24 ${isUnique && s.focus ? (invalid ? 'ring-[3px]' : 'border-ring ring-[3px] ring-ring/50') : ''}`}
            value={isUnique ? s.unique : String(rule.value)}
            aria-invalid={invalid || undefined}
            // sin los botones de giro del navegador: el real solo los muestra al pasar el puntero
            style={{ appearance: 'textfield' as CSSProperties['appearance'] }}
          />
        ) : (
          <Switch checked={rule.value === true} />
        )}
      </div>
    </div>
  );
};

const Section: FC<{ title: string; rules: Rule[]; s: PolicyState }> = ({ title, rules, s }) => (
  <section className="mb-4 overflow-hidden rounded-lg border border-border">
    <header className="border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold">{title}</header>
    <div className="divide-y divide-border">
      {rules.map((r) => (
        <RuleRow key={r.key} rule={r} s={s} />
      ))}
    </div>
  </section>
);

const Breadcrumb: FC<{ items: string[] }> = ({ items }) => (
  <nav className="page-breadcrumb">
    {items.map((t, i) => (
      <span key={t} style={{ display: 'contents' }}>
        {i > 0 && <ChevronRight />}
        <span data-slot={i === items.length - 1 ? 'breadcrumb-page' : undefined}>{t}</span>
      </span>
    ))}
  </nav>
);

const PolicyPage: FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px' }}>
    <div className="page-header">
      <Breadcrumb items={['Socio comercial', 'Política de Contraseñas']} />
      <div className="flex items-start justify-between gap-4">
        <h1 className="page-title">Política de Contraseñas</h1>
        <span className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus size={16} />
          Configurar un operador u organización
        </span>
      </div>
    </div>
    <div className="surface-card" style={{ padding: 24 }}>
      <div className="mb-3 flex items-center gap-3 text-base font-semibold text-heading-foreground">
        <span className="icon-tile icon-tile--lg">
          <KeyRound />
        </span>
        Políticas configuradas
      </div>
      <p className="text-muted-foreground mb-4 max-w-3xl text-sm">
        La política de Sistema aplica a todos. Un operador u organización puede cambiar las reglas que necesite y hereda el resto.
      </p>
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b">
            {['Nombre', 'Longitud', 'Caract. distintos', 'Número', 'Símbolo', 'Comunes', 'Filtradas', 'Usuario'].map((h) => (
              <th key={h} className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['Sistema', '8', '2'],
            ['Transportes Alfa', '8', '2']
          ].map((r, i) => (
            <tr key={r[0]} className={`border-b ${i === 0 ? 'bg-muted/40' : ''}`}>
              <td className="p-2 align-middle whitespace-nowrap">
                <span className={i === 0 ? 'rounded-full border border-primary-tint-border bg-primary-tint px-2 py-0.5 text-xs font-medium text-primary-ink' : 'rounded-full border border-border px-2 py-0.5 text-xs font-medium'}>
                  {r[0]}
                </span>
              </td>
              <td className="p-2 text-muted-foreground">{r[1]}</td>
              <td className="p-2 text-muted-foreground">{r[2]}</td>
              {['Sí', 'Sí', 'Sí', 'Sí', 'Sí'].map((v, k) => (
                <td key={k} className="p-2 text-muted-foreground">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const PolicyScreen: FC<{ s: PolicyState }> = ({ s }) => {
  const invalid = s.own && !isValidUnique(s.unique);
  const dirty = s.own;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PolicyPage />
      <Pane
        className="custom-sliding-pane-form"
        title="Política de contraseñas"
        subtitle="Organización: Transportes Alfa"
        width={896}
        p={s.pane}
        footer={<FormActionsFooter saveDisabled={(!dirty && true) || invalid} saving={s.saving} savePress={s.savePress} frame={s.frame} saveAnchor="save" />}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Reglas para los usuarios de esta organización. Lo que no definas aquí se hereda del operador o del sistema.
        </p>
        <Section title="Longitud y complejidad" rules={COMPLEXITY} s={s} />
        <Section title="Contraseñas inseguras" rules={BLOCKLIST} s={s} />
        <section className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Forzar cambio de contraseña al guardar</div>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">
              Al guardar, 12 usuarios que dependen de esta política deberán definir una contraseña nueva en su próximo inicio de sesión. Las sesiones abiertas no se cierran.
            </p>
          </div>
          <Switch checked={false} />
        </section>
      </Pane>
    </div>
  );
};

// ── Pantalla 2: Usuarios > Creación Rápida con contraseña manual ─────────────────────────

export type CreateState = {
  frame: number;
  pane: number;
  /** Desplazamiento del contenido del panel (px de UI). */
  scroll: number;
  mode: 'auto' | 'manual';
  /** 0..1 aparicion de los campos de contraseña manual. */
  manualIn: number;
  pw: string;
  show: boolean;
  focus: boolean;
  /** Muestra el aviso de la politica (ya se valido). */
  validated: boolean;
  /** Politica vigente en la organizacion del usuario. */
  policy: { requiredLength: number; requiredUniqueChars: number };
  eyePress: number;
};

/** getPasswordPolicyError (PR #1785): cuenta los distintos en MAYUSCULAS y dice cuantos pide. */
export const policyError = (value: string, p: { requiredLength: number; requiredUniqueChars: number }) => {
  if (!value) return null;
  const password = value.toUpperCase();
  const messages: string[] = [];
  if (password.length < p.requiredLength) messages.push(`La contraseña debe tener al menos ${p.requiredLength} caracteres`);
  if (new Set(password).size < p.requiredUniqueChars) {
    messages.push(`La contraseña debe tener al menos ${p.requiredUniqueChars} caracteres distintos (mayúsculas y minúsculas cuentan como el mismo)`);
  }
  return messages.length ? messages.join('\n') : null;
};

const USERS = [
  ['Carlos Méndez', 'cmendez@ejemplo.com', 'Despachador', 'Transportes Alfa'],
  ['Lucía Barrios', 'lbarrios@ejemplo.com', 'Supervisor', 'Transportes Alfa'],
  ['Diego Paz', 'dpaz@ejemplo.com', 'Monitoreo', 'Logística Norte'],
  ['Sofía Ruiz', 'sruiz@ejemplo.com', 'Despachador', 'Distribuidora Sur'],
  ['Mario León', 'mleon@ejemplo.com', 'Administrador', 'Transportes Alfa']
];

const UsersPage: FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px' }}>
    <div className="page-header">
      <Breadcrumb items={['Administración', 'Usuarios']} />
      <h1 className="page-title">Usuarios</h1>
    </div>
    <div className="surface-card" style={{ padding: '6px 0', marginTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.6fr 1fr 1.2fr', padding: '12px 22px', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
        <span>Nombre</span>
        <span>Correo</span>
        <span>Rol</span>
        <span>Organización</span>
      </div>
      {USERS.map((u) => (
        <div key={u[1]} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.6fr 1fr 1.2fr', padding: '13px 22px', fontSize: 13, borderTop: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <span style={{ fontWeight: 700 }}>{u[0]}</span>
          <span style={{ color: 'var(--muted-foreground)' }}>{u[1]}</span>
          <span>{u[2]}</span>
          <span>{u[3]}</span>
        </div>
      ))}
    </div>
  </div>
);

const RadioRow: FC<{ on?: boolean; anchor?: string; children: ReactNode }> = ({ on, anchor, children }) => (
  <div className="mb-6 flex items-center gap-2">
    <span
      data-slot="radio-group-item"
      data-anchor={anchor}
      className="relative aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs"
    >
      {on && <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />}
    </span>
    <span className="form-label mb-0 cursor-pointer select-none">{children}</span>
  </div>
);

/** InputPasswordToggle de reactive: Label + InputGroup (Input + boton ojo) + invalid-feedback. */
const PasswordField: FC<{
  label: string;
  value: string;
  show: boolean;
  focus?: boolean;
  invalidMsg?: string | null;
  anchor?: string;
  eyeAnchor?: string;
  eyePress?: number;
}> = ({ label, value, show, focus, invalidMsg, anchor, eyeAnchor, eyePress = 0 }) => (
  <div className="mb-4">
    <label className="form-label">
      {label}
      <span style={{ color: 'var(--destructive)' }}>&nbsp;*</span>
    </label>
    <div
      data-slot="input-group"
      className={`flex w-full items-stretch overflow-hidden rounded-md border-[1px] bg-transparent ${invalidMsg ? 'border-destructive ring-[3px] ring-destructive/20' : focus ? 'border-ring ring-[3px] ring-ring/50' : 'border-input'}`}
    >
      <input
        data-slot="input"
        data-anchor={anchor}
        readOnly
        type={show ? 'text' : 'password'}
        placeholder="Ingresa tu contraseña..."
        value={value}
        aria-invalid={invalidMsg ? true : undefined}
        className="h-(--app-control-h) min-w-0 flex-1 rounded-none border-0 bg-transparent px-3.5 py-1 text-sm outline-none placeholder:text-placeholder"
      />
      <button
        type="button"
        data-anchor={eyeAnchor}
        className="flex cursor-pointer items-center gap-1.5 border-l border-input px-3.5 text-sm whitespace-nowrap text-muted-foreground"
        style={{ transform: `scale(${1 - 0.08 * eyePress})` }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
    {invalidMsg && (
      <div className="invalid-feedback" style={{ display: 'block', whiteSpace: 'pre-line' }}>
        {invalidMsg}
      </div>
    )}
  </div>
);

const MANUAL_H = 168;

export const CreateScreen: FC<{ s: CreateState }> = ({ s }) => {
  const err = s.validated ? policyError(s.pw, s.policy) : null;
  const manual = s.mode === 'manual';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <UsersPage />
      <Pane
        className="custom-sliding-pane"
        title="Creación Rápida de Usuarios"
        width={768}
        p={s.pane}
        footer={<FormActionsFooter saveDisabled />}
      >
        <div style={{ transform: `translateY(${-s.scroll}px)` }}>
          <div className="mb-4">
            <FormLabel required>Nombre Completo</FormLabel>
            <TextField value="Ana Morales" />
          </div>
          <div className="mb-4">
            <FormLabel required>Correo</FormLabel>
            <TextField value="ana.morales@ejemplo.com" />
          </div>
          <small className="form-text text-muted mt-0" style={{ display: 'block', marginTop: -8 }}>
            Este correo será el nombre de usuario para iniciar sesión
          </small>
          <div className="mt-2 mb-1 flex items-center text-sm font-medium text-primary">
            <Plus size={14} className="me-1" />
            Agregar Usuario
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6">
            <div className="mb-4">
              <FormLabel required>Nivel de Acceso</FormLabel>
              <SelectField value="Operación" />
            </div>
            <div className="mb-4">
              <FormLabel required>Rol</FormLabel>
              <SelectField value="Despachador" />
            </div>
            <div className="mb-4">
              <FormLabel>Operador</FormLabel>
              <SelectField value="Operador Demo" />
            </div>
            <div className="mb-4">
              <FormLabel>Organización</FormLabel>
              <SelectField value="Transportes Alfa" />
            </div>
            <div className="mb-4">
              <FormLabel>División</FormLabel>
              <SelectField value="Zona Centro" />
            </div>
            <div className="mb-4">
              <FormLabel>Subdivisión</FormLabel>
              <SelectField value="Ruta 1" />
            </div>
          </div>
          <label className="form-label">Contraseña</label>
          <div className="grid gap-3" role="radiogroup">
            <RadioRow on={!manual}>Generar automáticamente una contraseña segura</RadioRow>
            <RadioRow on={manual} anchor="radio-manual">
              Crear contraseña
            </RadioRow>
            <RadioRow>Invitar por correo electrónico</RadioRow>
          </div>
          {/* Los campos viven siempre montados (altura 0 hasta elegir la opcion) para medir anclas. */}
          <div style={{ height: manual ? MANUAL_H * s.manualIn : 0, overflow: 'hidden', opacity: s.manualIn }}>
            <PasswordField label="Contraseña" value={s.pw} show={s.show} focus={s.focus} invalidMsg={err} anchor="pw-input" eyeAnchor="pw-eye" eyePress={s.eyePress} />
            <PasswordField label="Confirmar Contraseña" value="" show={false} />
          </div>
          <div className="mb-4 flex items-center gap-2" style={{ marginTop: manual ? 0 : 0 }}>
            <span
              data-slot="checkbox"
              data-state="checked"
              className="grid size-4 shrink-0 place-content-center rounded-[4px] border border-primary bg-primary text-primary-foreground shadow-xs"
            >
              <Check className="size-3.5" />
            </span>
            <span className="form-label mb-0 select-none">Pedir al usuario que cambie su contraseña cuando inicie sesión</span>
          </div>
        </div>
      </Pane>
    </div>
  );
};
