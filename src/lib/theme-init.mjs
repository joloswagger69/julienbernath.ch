/* Hell/Dunkel vor dem ersten Rendern setzen (gleicher Speicher-Schlüssel wie bisher).
   Steht als Text in einer eigenen Datei, damit astro.config.mjs genau diesen Text
   hashen und in die Content Security Policy (script-src) aufnehmen kann. */
export const THEME_INIT = "try { var t = localStorage.getItem('jb2-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}";
