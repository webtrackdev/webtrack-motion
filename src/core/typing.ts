// Escritura animada en inputs: texto visible segun el frame y cursor de texto.

/** Parte del texto escrita en `frame` si se empieza a escribir en `start` (fpc = frames por letra). */
export const typed = (frame: number, text: string, start: number, fpc = 1.6) => {
  if (frame < start) return '';
  return text.slice(0, Math.min(text.length, Math.floor((frame - start) / fpc) + 1));
};

/** Frame en que termina de escribirse. */
export const typedEnd = (text: string, start: number, fpc = 1.6) => start + Math.ceil(text.length * fpc);

/** Parpadeo del cursor de texto. */
export const caretOn = (frame: number) => Math.floor(frame / 15) % 2 === 0;
