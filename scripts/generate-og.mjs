// Generate the Open Graph share image (public/og-image.png, 1200x630).
//
// Renders a branded HTML card in headless Chromium and screenshots it. The card
// mirrors the app: the teal radial-gradient background and a dual-ring 24-hour
// clock illustration. Re-run with `node scripts/generate-og.mjs` after changing
// the design.

import puppeteer from 'puppeteer';
import { resolve } from 'node:path';

// A dual-ring clock built from stroke-dasharray arc segments. Decorative only.
const ring = (cx, cy, r, width, segments) => {
  const circ = 2 * Math.PI * r;
  return segments
    .map(({ start, frac, color }) => {
      const len = Math.max(frac * circ - 6, 0); // small gap between segments
      const gap = circ - len;
      const offset = -(start * circ);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}"
        stroke-width="${width}" stroke-dasharray="${len} ${gap}"
        stroke-dashoffset="${offset}" transform="rotate(-90 ${cx} ${cy})" />`;
    })
    .join('');
};

const clock = `
<svg width="430" height="430" viewBox="0 0 430 430" style="position:absolute;right:75px;top:100px">
  <g>
    ${ring(215, 215, 150, 36, [
      { start: 0.0, frac: 0.3, color: '#14b8a6' },
      { start: 0.3, frac: 0.15, color: '#fb923c' },
      { start: 0.45, frac: 0.25, color: '#60a5fa' },
      { start: 0.7, frac: 0.3, color: '#a78bfa' },
    ])}
    ${ring(215, 215, 95, 30, [
      { start: 0.0, frac: 0.4, color: '#2dd4bf' },
      { start: 0.4, frac: 0.25, color: '#f472b6' },
      { start: 0.65, frac: 0.35, color: '#fbbf24' },
    ])}
    <text x="215" y="228" text-anchor="middle" font-size="40" font-weight="700"
      fill="#0f766e" font-family="system-ui, sans-serif">24h</text>
  </g>
</svg>`;

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" />
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #14b8a6 100%);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .content { position: absolute; left: 80px; top: 0; height: 630px;
    display: flex; flex-direction: column; justify-content: center; width: 640px; }
  .eyebrow { font-size: 26px; font-weight: 600; color: #0f766e; letter-spacing: 1px;
    text-transform: uppercase; }
  h1 { font-size: 76px; font-weight: 800; color: #0f172a; line-height: 1.05;
    margin-top: 14px; }
  p { font-size: 32px; color: #334155; margin-top: 24px; line-height: 1.35; }
  .url { font-size: 26px; font-weight: 600; color: #0f766e; margin-top: 40px; }
</style>
</head>
<body>
  <div class="content">
    <div class="eyebrow">Clock Chart</div>
    <h1>Visualize your 24-hour daily schedule</h1>
    <p>Turn a CSV or Excel list of activities into a clock chart, right in your browser.</p>
    <div class="url">clockchart.pararang.com</div>
  </div>
  ${clock}
</body>
</html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const outPath = resolve(process.cwd(), 'public', 'og-image.png');
  await page.screenshot({ path: outPath, type: 'png' });
  console.log(`Wrote ${outPath}`);
} finally {
  await browser.close();
}
