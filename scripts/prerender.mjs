// Build-time prerender.
//
// The app is a client-rendered SPA, so a crawler that does not run JavaScript
// sees an empty <div id="root">. This script serves the built site with Vite's
// preview server, lets the app render the default (pre-upload) state in a real
// browser, then writes that fully-populated HTML back over dist/index.html.
//
// On a real visit the client bundle still runs and React re-mounts into #root,
// so there is no behaviour change for users — only crawlers and the first paint
// benefit from the baked-in markup. Run after `vite build`.

import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = 4180;
const HOST = '127.0.0.1';

const server = await preview({ preview: { port: PORT, host: HOST } });
const url = `http://${HOST}:${PORT}/`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // Wait for the static content section to render so we know React has mounted.
  await page.waitForSelector('section h2', { timeout: 15000 });

  const html = await page.content();
  const outPath = resolve(process.cwd(), 'dist', 'index.html');
  writeFileSync(outPath, html, 'utf8');
  console.log(`Prerendered ${url} -> dist/index.html (${html.length} bytes)`);
} finally {
  await browser.close();
  await new Promise((res) => server.httpServer.close(res));
}
