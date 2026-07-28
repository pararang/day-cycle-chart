// Build-time prerender — pure Node.js, no browser.
//
// After the client build, this does a minimal SSR build of the React app,
// renders it to a string with react-dom/server, and bakes that HTML into
// dist/index.html so crawlers see real content instead of an empty shell.
//
// Run after `vite build`.

import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const SSR_OUT = resolve(process.cwd(), 'dist-ssr');

try {
  // 1. SSR build — compiles the app for Node.js
  await build({
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: SSR_OUT,
      rollupOptions: { output: { format: 'esm' } },
      minify: false,
    },
  });

  // 2. Load the SSR bundle and render
  const mod = await import(resolve(SSR_OUT, 'entry-server.js'));
  const { html: appHtml } = await mod.render('/');

  // 3. Bake into the client HTML
  const htmlPath = resolve(process.cwd(), 'dist', 'index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const result = html.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );
  writeFileSync(htmlPath, result, 'utf8');
  console.log(`Prerendered -> dist/index.html (${result.length} bytes)`);
} finally {
  rmSync(SSR_OUT, { recursive: true, force: true });
}
