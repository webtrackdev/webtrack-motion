# Alta de una plataforma o un tema

1. **Reúne la marca.**
   - Repo: hoja CSS principal (entrada de Tailwind, `globals.css`, `index.css`), variables de
     `:root` o el tema de Tailwind (`--primary`, `--background`, `--radius`), la fuente
     (`font-family`, link de Google Fonts) y el logo (`public/`, `src/assets/`).
   - URL: tokens extraídos con [captura-url.md](captura-url.md).
   - Tema: elige colores y fuente acordes al tema.
2. **Corre el script** (el `id` en minúsculas con guiones):

   ```bash
   node scripts/new-platform.mjs <id> --name "Nombre" --repo ../ruta --css ruta/del/css \
     --primary "#hex" --accent "#hex" --font "Google Font" --logo ruta/logo.png
   ```

   Sin repo: `--url https://...`. Tema sin plataforma: `--theme 1`.
   Crea `src/platforms/<id>/`, copia el logo a `public/<id>/brand/` y registra la plataforma en
   `platforms.json` y, si hay repo, en `tsconfig.json`.
3. **Ajusta `platform.ts`** con los tokens reales (ink, body, muted, bg, border, success,
   danger). Si la fuente no está en Google Fonts, cárgala en `fonts.ts` con `@remotion/fonts`
   desde un archivo en `public/<id>/`.
4. **Comprueba:** `./still.sh <id> <id>-ejemplo 40 150`. Si el CSS del repo no importa
   (plugin faltante, rutas), copia solo los tokens al `style.css` de la plataforma.
5. Borra `videos/ejemplo` cuando exista el primer video real.
