# Estudiar una plataforma desde su URL

Usa el navegador integrado (`mcp__Claude_Browser__*`). Si pide login, pide al usuario que
inicie sesión en el panel y espera; nunca escribas credenciales.

1. Recorre el flujo de la tarea y toma capturas de cada estado (panel cerrado y abierto,
   formulario vacío y lleno, mensaje de éxito). Son la referencia de la réplica.
2. Lee los textos exactos con `get_page_text` o `read_page`.
3. Extrae los tokens con `javascript_tool`:

```js
(() => {
  const root = getComputedStyle(document.documentElement);
  const vars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const r of sheet.cssRules)
        if (r.selectorText === ':root') for (const p of r.style) if (p.startsWith('--')) vars[p] = root.getPropertyValue(p).trim();
    } catch {}
  }
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor, font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, radius: s.borderRadius, border: s.border, shadow: s.boxShadow };
  };
  const body = getComputedStyle(document.body);
  return {
    font: body.fontFamily, text: body.color, bg: body.backgroundColor, vars,
    button: pick('button'), primary: pick('button[type=submit], .btn-primary, [class*="primary"]'),
    input: pick('input, textarea'), card: pick('[class*="card"], [class*="panel"]'),
    logo: [...document.querySelectorAll('img')].map((i) => i.src).filter((s) => /logo/i.test(s)).slice(0, 3)
  };
})()
```

4. **Íconos y formas.** Inspecciona cada ícono y cada forma propia (pines, chips, menús):
   copia su `<svg>`, el sprite o la clase de la fuente de íconos y guárdalo como componente
   de la plataforma. Nunca lo cambies por otro de lucide. Ver
   [fidelidad-visual.md](fidelidad-visual.md).
5. Con eso completa `platform.ts` y replica cada pantalla con los mismos tamaños, radios,
   sombras y colores. La réplica usa datos ficticios aunque el sitio muestre datos reales.
