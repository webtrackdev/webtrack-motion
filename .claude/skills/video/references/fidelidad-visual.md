# Fidelidad visual: el video se ve como la aplicación

Regla del usuario (2026-11-05): en **cualquier** video de **cualquier** aplicación se usan los
mismos íconos, la misma estructura y el mismo aspecto que la aplicación real. Nada se
inventa ni se sustituye por algo "parecido". Si el espectador no reconoce su aplicación a
simple vista, el video no está terminado.

## Qué se copia siempre

1. **Íconos.** Cada ícono visible sale de la fuente real de la aplicación.
   - Repo: abre el componente y mira qué importa (`lucide-react`, un set propio como
     IcoMoon, SVG en `assets/`, una fuente de íconos). Usa esa misma librería y ese mismo
     nombre. En Webtrack: `IcoIcon` con el nombre del `selection.json`; los íconos de clase
     de ubicación vienen del dato (`locationClassIconName`), no se eligen.
   - URL: inspecciona el DOM del elemento (`javascript_tool`): copia el `<svg>` o `<path>`
     en línea, el sprite (`<use href>`) o la clase de la fuente de íconos, y guárdalo en
     `src/platforms/<id>/` como componente. Nunca lo reemplaces por otro de lucide.
   - Incluye los de la entrada y el cierre del video: salen del mismo set.
2. **Estructura.** Mismo orden de campos, mismas secciones, mismos encabezados, mismas
   columnas, mismos botones y en el mismo lugar. Se lee el componente (repo) o se recorre
   la pantalla (URL); no se rediseña "para que quede mejor".
3. **Apariencia.** CSS real de la aplicación (repo: se importa con `@<id>/...`; URL: tokens
   extraídos), con las mismas clases. Tamaños, radios, sombras, tipografía y colores reales.
   Formas especiales también: un pin del mapa, un chip, un menú, un aviso se dibujan como
   los dibuja la aplicación (su CSS o su HTML), no como una versión genérica.
4. **Textos.** Del i18n o de la pantalla, tal cual. Los datos de ejemplo son ficticios,
   pero con el formato real (un correo se ve como correo, una ruta como ruta).
5. **Estados.** Abierto, cerrado, enfocado, cargando, error y vacío se ven como en la
   aplicación (su spinner, su pantalla de error, su aviso), no como los imagino.

## Antes de renderizar: lista de verificación

- [ ] Cada ícono visible está trazado a su fuente (archivo del repo o elemento del DOM).
- [ ] No hay íconos de otra librería "porque se parecen".
- [ ] La estructura de cada pantalla coincide con su componente o con la pantalla real.
- [ ] Las formas propias (pines, chips, menús, avisos) siguen el CSS o HTML real.
- [ ] Textos del i18n o de la pantalla.

Si algo de la aplicación no se puede replicar fiel (un mapa con teselas, una imagen de
cliente), se simplifica y se dice en el mensaje final; no se sustituye por algo ajeno.
Un tema sin aplicación (deportes, cursos) no tiene esta regla: ahí se ilustra libremente.
