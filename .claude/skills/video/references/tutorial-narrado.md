# Tutorial narrado (video explicativo con voz)

El "Ver video explicativo" de una novedad en Versio es un **tutorial con voz**, no el mismo clip del GIF.
Modelo de referencia: `src/platforms/webtrack/videos/modo-delivery-jobs/` (Modo Delivery en la app de Jobs)
y su guion completo en `src/platforms/webtrack/videos/modo-delivery-jobs/guion.md`. Léelos antes de empezar.

## Qué es (y en qué se diferencia del clip del GIF)

| | Clip corto (GIF) | Tutorial narrado (MP4) |
|---|---|---|
| Duración | 10 a 20 s | según la novedad (ver abajo) |
| Audio | ninguno | voz (ElevenLabs) + música con ducking |
| Ritmo | lo marca la imagen | **la voz manda**: cada escena espera a su frase |
| Contenido | el cambio, de un vistazo | qué es, dónde está, cómo se usa paso a paso, casos y resumen |

## Duración según la novedad

- **Funcionalidad nueva o destacada**: 2 a 4 min (15 a 24 frases).
- **Mejora**: 1 a 2 min (8 a 14 frases).
- **Corrección**: 40 a 70 s (4 a 7 frases): qué fallaba, qué pasa ahora y dónde se nota.

No rellenes: si la novedad es pequeña, el tutorial es corto.

## Estructura (como el de Modo Delivery)

1. **Qué es**: Hook con `tag="TUTORIAL · <Módulo>"` y una o dos frases de para qué sirve, a quién le sirve y por qué importa.
2. **Pasos**: una sección por cada cosa que hace el usuario (dónde entra, qué activa, qué ve). `StepTag` "PASO n" arriba a la izquierda (está en `ModoDeliveryJobs.tsx`: cópialo a tu carpeta),
   la pantalla real (fidelidad visual) con cursor, cámara y resaltes sincronizados con la frase.
3. **Casos o detalles**: permisos, excepciones, valores posibles o un ejemplo con datos ficticios. Si ayuda, un diagrama simple.
4. **Resumen**: Recap en 2 o 3 puntos (como `Recap` en `modo-delivery-jobs/Diagrams.tsx`) y `EndCard` de `core/templates`.

`Caption` con la idea clave de cada frase (no transcribas la voz: frase corta, con los textos del i18n).

## Guion (narracion.md)

- Español neutro, tuteo, frases de 8 a 25 palabras, **una idea por frase**. Habla al usuario final, no al desarrollador.
- Nombres de pantallas, botones y opciones **exactos del i18n** (en español).
- Nada de nombres de PR, ramas, tickets ni código. Nada inventado: si el PR no lo dice, no lo narres.
- Costo: `node scripts/narrate.mjs check <plataforma> <slug>` lo estima. Apunta a menos de 3.500 caracteres
  (unos 1 USD con ElevenLabs); nunca más de 5.000.

## Flujo (la voz manda)

1. Escribe `narracion.md` en la carpeta del video con ventanas provisionales, una frase por bloque:
   ```
   <!-- #0 [0.70 -> 8.00] -->
   Hoy te explico, paso a paso, ...
   ```
2. `node scripts/narrate.mjs check <plataforma> <slug>` (gratis) y corrige lo que avise.
3. `node scripts/narrate.mjs synthesize <plataforma> <slug>`: genera la voz (cobra créditos, queda en caché).
4. `node scripts/voice-timeline.mjs <plataforma> <slug> --sections=0-1,2-5,6-9,...`: con la duración real de
   cada frase escribe `timeline.json` (frames de cada frase y sección) y reescribe `narracion.md`.
5. `node scripts/narrate.mjs synthesize <plataforma> <slug>` otra vez (sin costo: usa la caché) para colocar la voz en esas ventanas.
6. Arma el video leyendo `timeline.json` (`const P = (i) => timeline.phrases[i]`, `DURATION = timeline.duration`):
   cada acción se coloca respecto a `P(i).start` / `P(i).end`, igual que en `ModoDeliveryJobs.tsx`.
7. Revisa con stills en el inicio, la mitad y el final de cada sección.

El render y la mezcla (`./render.sh` + `narrate.mjs mux`) los hace el worker o tú a mano al final.
Si cambias una frase, repite desde el paso 3 (solo cobra la frase nueva).
