// Posiciones de elementos de la UI replicada, medidas del DOM real una vez cargada la
// fuente. Permite que el cursor apunte a un boton sin coordenadas escritas a mano.
// Marca los elementos con data-anchor="nombre"; las posiciones son de layout (sin
// transforms), relativas al contenedor raiz.
import { useLayoutEffect, useState, type RefObject } from 'react';
import { continueRender, delayRender } from 'remotion';

export type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number };

const measure = (el: HTMLElement, root: HTMLElement): Box => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const parent = n.offsetParent as HTMLElement | null;
    if (parent && parent !== root) {
      x += parent.clientLeft;
      y += parent.clientTop;
    }
    n = parent;
  }
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
};

export const useAnchors = (root: RefObject<HTMLElement | null>, ready: Promise<unknown>) => {
  const [anchors, setAnchors] = useState<Record<string, Box> | null>(null);
  const [handle] = useState(() => delayRender('Midiendo anclas de la UI'));
  useLayoutEffect(() => {
    let cancelled = false;
    ready.then(() =>
      requestAnimationFrame(() => {
        if (cancelled || !root.current) return;
        const out: Record<string, Box> = {};
        root.current.querySelectorAll<HTMLElement>('[data-anchor]').forEach((el) => {
          out[el.dataset.anchor!] = measure(el, root.current!);
        });
        setAnchors(out);
        continueRender(handle);
      })
    );
    return () => {
      cancelled = true;
    };
  }, [handle, ready, root]);
  return anchors;
};
