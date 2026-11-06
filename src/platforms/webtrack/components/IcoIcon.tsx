// Iconos propios de Webtrack (set IcoMoon de reactive, solo lectura).
import type { FC } from 'react';
import iconSet from '@webtrack/utility/icomoon/IcomoonReactive/selection.json';

type IcoSet = { height?: number; icons: { icon: { paths: string[]; width?: number }; properties: { name: string } }[] };
const SET = iconSet as unknown as IcoSet;

export const IcoIcon: FC<{ name: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ name, size = 20, color = 'currentColor', style }) => {
  const found = SET.icons.find((i) => i.properties.name === name);
  if (!found) return null;
  const h = SET.height ?? 1024;
  const w = found.icon.width ?? h;
  return (
    <svg width={(size * w) / h} height={size} viewBox={`0 0 ${w} ${h}`} fill={color} style={style}>
      {found.icon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
};
