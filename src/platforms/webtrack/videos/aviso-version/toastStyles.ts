// Hoja de estilos del toast de nueva version, copiada tal cual de reactive
// (src/components/ReloadPrompt/ReloadPrompt.tsx, `toastStyles`) con la linea que agrega el PR #1762.
export const toastStyles = `
.wt-version-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999;
  /* Un Dialog modal de Radix (SlidingPane) pone pointer-events: none en el body y
     este toast se monta ahi, asi que lo heredaba y no se podia pulsar. */
  pointer-events: auto;
  box-sizing: border-box;
  width: 380px;
  max-width: calc(100vw - 32px);
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  animation: wtVersionToastSlideIn 0.3s ease-out;
}

.wt-version-toast__body {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* El SVG es autocontenido y trae su propia animacion (SMIL) */
.wt-version-toast__webi {
  flex: 0 0 auto;
  width: 88px;
  height: auto;
  aspect-ratio: 620 / 700;
  margin: -6px 0;
}

.wt-version-toast__text {
  flex: 1 1 auto;
  min-width: 0;
}

.wt-version-toast__title {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #18181b;
}

.wt-version-toast__desc {
  margin-top: 3px;
  font-size: 13px;
  line-height: 18px;
  color: #71717a;
}

.wt-version-toast__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.wt-version-toast__btn {
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
}

.wt-version-toast__btn--ghost {
  background: transparent;
  border: 1px solid #d4d4d8;
  color: #52525b;
  font-weight: 500;
}

.wt-version-toast__btn--ghost:hover {
  background: #f4f4f5;
  border-color: #a1a1aa;
}

.wt-version-toast__btn--primary {
  background: var(--primary);
  border: none;
  color: #ffffff;
  font-weight: 600;
}

.wt-version-toast__btn--primary:hover {
  filter: brightness(1.15);
}

/* Telefono: el toast ocupa el ancho util y respeta el area segura */
@media (max-width: 575.98px) {
  .wt-version-toast {
    left: 12px;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: none;
    padding: 14px 16px;
  }

  .wt-version-toast__body {
    gap: 12px;
  }

  .wt-version-toast__webi {
    width: 64px;
  }

  .wt-version-toast__actions {
    margin-top: 12px;
  }

  .wt-version-toast__btn {
    flex: 1 1 0;
    padding: 10px 12px;
  }
}

/* Pantallas muy bajas (telefono apaisado): Webi estorba mas de lo que aporta */
@media (max-height: 420px) {
  .wt-version-toast__webi {
    display: none;
  }
}

@keyframes wtVersionToastSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wt-version-toast {
    animation: none;
  }
}
`;
