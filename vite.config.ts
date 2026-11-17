import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
import { renderStory, renderKit, esc } from './src/render/html';
import { WATCHES } from './src/content/watches';
import { STOPS } from './src/content/stops';

/** Renders the whole story into index.html at build (and dev) time, so the text is real HTML. */
function story(): Plugin {
  return {
    name: 'ddw-story',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('index.html')) return html;
        const kit = renderKit();
        return html
          .replace('<!--STORY-->', renderStory())
          .replace('<!--KIT_LOGBOOK-->', kit.logbook)
          .replaceAll('<!--KIT_OPTIONS-->', kit.opts)
          .replace('<!--KIT_FIELD-->', kit.field)
          .replace('<!--KIT_CARE-->', kit.care)
          .replace('<!--KIT_GLOSSARY-->', kit.gloss)
          .replace('<!--KIT_SOURCES-->', kit.src);
      },
    },
  };
}

const SITE = 'https://deepdivewatches.com';
const GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-JCPV5MB308"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JCPV5MB308');</script>`;

/** Google Analytics, unless building a preview (DDW_GA=off). */
function analytics(): Plugin {
  return {
    name: 'ddw-ga',
    apply: 'build',
    transformIndexHtml(html) {
      return process.env.DDW_GA === 'off' ? html : html.replace('</head>', `${GA}\n</head>`);
    },
  };
}

/** Tiny share pages with their own title and image, e.g. /s/rolex-deepsea-challenge/. */
function sharePages(): Plugin {
  return {
    name: 'ddw-share',
    apply: 'build',
    generateBundle() {
      const pages: { id: string; anchor: string; title: string; desc: string }[] = [];
      for (const w of WATCHES) pages.push({ id: w.id, anchor: `watch-${w.id}`, title: `${w.brand} ${w.model}, rated ${w.rating.toLocaleString('en-US')}m · The Deep Dive`, desc: w.why });
      for (const s of STOPS) if (s.kind === 'chapter') pages.push({ id: s.id, anchor: s.id, title: `${s.title} · The Deep Dive`, desc: s.problem });
      for (const p of pages) {
        const url = `${SITE}/s/${p.id}/`;
        const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(p.title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${SITE}/#${p.anchor}"><meta property="og:type" content="article"><meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="${SITE}/og/og-${p.id}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}/og/og-${p.id}.jpg">
<meta http-equiv="refresh" content="0; url=../../#${p.anchor}"><script>location.replace('../../#${p.anchor}')</script>
</head><body style="background:#04131c;color:#eaf4f7;font-family:system-ui"><p><a style="color:#59e4ff" href="../../#${p.anchor}">${esc(p.title)}</a></p></body></html>`;
        this.emitFile({ type: 'asset', fileName: `s/${p.id}/index.html`, source: html });
      }
    },
  };
}

export default defineConfig(({ command }) => ({
  base: './',
  plugins: [story(), analytics(), sharePages()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: (command === 'serve'
        ? { main: resolve(root, 'index.html'), sprites: resolve(root, 'dev/sprites.html'), og: resolve(root, 'dev/og.html') }
        : { main: resolve(root, 'index.html') }) as Record<string, string>,
    },
  },
  server: { host: true, port: 5173 },
}));
