// Fragmento del menu lateral (textos reales del i18n: sidebar.logistics, sidebar.screen14-17),
// flotando como tarjeta.
import type { FC, ReactNode } from 'react';
import { BarChart3, Briefcase, ChevronDown, ChevronRight, Map, Truck } from 'lucide-react';
import { Img, staticFile } from 'remotion';
import { shadows } from '../../../../core/theme';
import { BRAND } from '../../platform';

const SHADOW = shadows(BRAND);

const Item: FC<{ icon?: ReactNode; label: string; active?: boolean; child?: boolean; open?: boolean; group?: boolean; anchor?: string }> = ({
  icon,
  label,
  active,
  child,
  open,
  group,
  anchor
}) => (
  <div
    data-anchor={anchor}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      height: 50,
      padding: child ? '0 18px 0 58px' : '0 18px',
      borderRadius: 12,
      fontSize: child ? 19 : 20,
      fontWeight: active ? 800 : group ? 700 : 600,
      color: active ? BRAND.primary : group ? BRAND.ink : BRAND.body,
      background: active ? 'rgba(4,14,255,.08)' : 'transparent'
    }}
  >
    {icon}
    <span style={{ flex: 1 }}>{label}</span>
    {group && (open ? <ChevronDown size={18} color={BRAND.muted} /> : <ChevronRight size={18} color={BRAND.muted} />)}
  </div>
);

export const SidebarCard: FC<{ activeCatalog: boolean }> = ({ activeCatalog }) => (
  <div
    style={{
      width: 460,
      padding: '26px 18px 20px',
      borderRadius: 26,
      background: '#fff',
      border: `1px solid ${BRAND.border}`,
      boxShadow: SHADOW.window,
      fontFamily: BRAND.font
    }}
  >
    <Img src={staticFile('webtrack/brand/webtrack-wordmark.png')} style={{ height: 54, margin: '0 0 18px 10px' }} />
    <Item icon={<Map size={22} />} label="Mapa" />
    <Item icon={<Briefcase size={22} />} label="Jobs" group />
    <Item icon={<Truck size={22} />} label="Logística" group open />
    <Item label="Catálogo Ruta Logística" child active={activeCatalog} anchor="menu-catalog" />
    <Item label="Monitor Ruta Logística" child />
    <Item label="Reporte Ruta Logística" child />
    <Item label="Asignar Ruta Logística" child />
    <Item icon={<BarChart3 size={22} />} label="Reportes" group />
  </div>
);
