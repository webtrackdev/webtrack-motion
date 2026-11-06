// Replica de la pantalla de __TITLE__. TODO: sustituye este esqueleto por la pantalla REAL:
// lee el componente en el repo, usa sus clases, su CSS (@<id>/...), sus iconos y su i18n
// (references/fidelidad-visual.md). Lo que el cursor toca va con data-anchor y esta montado
// desde el frame 0 (visibility/opacity, nunca desmontado).
import type { FC } from 'react';
import { Btn, Label, SelectField } from '../../components/FormKit';

export type ScreenState = {
  frame: number;
  /** 0..1 algo se abre (lista, panel, aviso). */
  open: number;
  /** Ya se aplico el cambio que muestra el PR. */
  changed: boolean;
  pressA: number;
  pressB: number;
  /** 0..1 resalte verde de lo que cambio. */
  glow: number;
};

export const Screen: FC<{ s: ScreenState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', display: 'grid', placeItems: 'center' }}>
    <div className="surface-card" style={{ padding: '18px 22px', width: 560 }}>
      <h1 className="page-title" style={{ marginBottom: 16 }}>
        TODO: titulo real de la pantalla
      </h1>
      <Btn anchor="btn-a" press={s.pressA}>
        TODO: boton que abre
      </Btn>
      <div style={{ marginTop: 16 }}>
        <Label>TODO: campo</Label>
        <SelectField value={s.changed ? 'TODO: valor nuevo' : 'TODO: valor anterior'} glow={s.glow} />
      </div>
      <div style={{ marginTop: 16, opacity: s.open, visibility: s.open > 0.01 ? 'visible' : 'hidden' }}>
        <Btn anchor="btn-b" press={s.pressB} variant="outline">
          TODO: opcion que cambia
        </Btn>
      </div>
    </div>
  </div>
);
