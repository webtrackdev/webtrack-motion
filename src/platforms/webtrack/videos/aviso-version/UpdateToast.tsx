// Replica del aviso de nueva version (UpdateToast de reactive/src/components/ReloadPrompt).
// Mismo HTML, mismas clases `.wt-version-toast*`, misma hoja de estilos y mismo Webi del cohete;
// textos del i18n real (reloadPrompt.*). Solo se anima desde afuera (entrada con resorte, hover y
// pulsacion del boton), porque las animaciones CSS estan apagadas en core/base.css.
import type { CSSProperties, FC } from 'react';
import { Img, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';
import { toastStyles } from './toastStyles';

// El toast real declara 'Montserrat' como primera familia.
loadFont('normal', { weights: ['500', '600'], subsets: ['latin'] });

export const UpdateToast: FC<{
  /** 0..1 entrada con resorte (puede pasar de 1 por el rebote). */
  enter: number;
  /** 0..1 salida al descartar. */
  exit: number;
  /** 0..1 hover sobre "Ahora no". */
  hover: number;
  /** 0..1 pulsacion de "Ahora no". */
  press: number;
}> = ({ enter, exit, hover, press }) => {
  const visible = enter > 0.01 && exit < 0.99;
  const style: CSSProperties = {
    // En la app es `fixed` (esquina del viewport); aqui el viewport es la ventana de la UI.
    position: 'absolute',
    // El z-index real (99999) lo taparia el cursor del video; aqui basta con ir sobre el panel.
    zIndex: 40,
    visibility: visible ? 'visible' : 'hidden',
    opacity: Math.min(1, enter * 1.6) * (1 - exit),
    transform: `translateY(${(1 - enter) * 70 + exit * 18}px) scale(${0.9 + 0.1 * enter - exit * 0.04})`,
    transformOrigin: '100% 100%'
  };
  const ghost: CSSProperties = {
    background: `color-mix(in srgb, #f4f4f5 ${hover * 100}%, transparent)`,
    borderColor: `color-mix(in srgb, #a1a1aa ${hover * 100}%, #d4d4d8)`,
    transform: `scale(${1 - 0.06 * press})`
  };
  return (
    <div className="wt-version-toast" role="status" aria-live="polite" style={style}>
      <style>{toastStyles}</style>

      <div className="wt-version-toast__body">
        <Img className="wt-version-toast__webi" src={staticFile('webtrack/webi/webi-cohete-flotando.svg')} alt="" />

        <div className="wt-version-toast__text">
          <div className="wt-version-toast__title">Nueva versión disponible</div>
          <div className="wt-version-toast__desc">Recarga para ver los últimos cambios.</div>
        </div>
      </div>

      <div className="wt-version-toast__actions">
        <button type="button" data-anchor="toast-dismiss" style={ghost} className="wt-version-toast__btn wt-version-toast__btn--ghost">
          Ahora no
        </button>
        <button type="button" className="wt-version-toast__btn wt-version-toast__btn--primary">
          Recargar
        </button>
      </div>
    </div>
  );
};
