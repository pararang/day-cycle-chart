# PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-29
**Commit:** 113600f
**Branch:** main

## OVERVIEW
Day-cycle-chart: a Vite + React + TypeScript SPA that turns an uploaded CSV/Excel schedule into a dual-ring 24-hour clock chart, rendered as SVG.

## STRUCTURE
```
day-cycle-chart/
├── src/
│   ├── components/       # React views; ui/ is unmodified shadcn primitives (skip editing style there)
│   ├── hooks/             # use-toast, use-mobile — copied shadcn hooks, not app-specific
│   ├── lib/                # pure domain logic — see src/lib/AGENTS.md
│   ├── pages/              # route targets (Index, NotFound) wired in App.tsx
│   ├── entry-server.tsx    # SSR render entry used only by scripts/prerender.mjs
│   └── main.tsx             # client hydration entry
├── scripts/
│   ├── prerender.mjs        # post-build: renders dist/index.html via headless Chromium (Puppeteer)
│   └── generate-og.mjs      # regenerate public/og-image.png (1200x630) after design changes
├── public/                  # static assets + sample_activities.csv (FileUpload's sample download)
├── CONTEXT.md                # domain vocabulary (Activity, ProcessedActivity, Zone, etc.) — read before touching src/lib
└── wrangler.toml              # Cloudflare Workers static-assets deploy config
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change how times/zones are computed | `src/lib/schedule.ts` | `processActivities` — pure, no React |
| Change arc/SVG geometry or label angle | `src/lib/chart-geometry.ts` | `activityArc` — pure, no React |
| Add a CSV/Excel column alias | `src/lib/parse.ts` | `ACTIVITY_KEYS` / `rowsToActivities` |
| Change chart colors | `src/lib/chart-activity.ts` | `COLORS` palette, cycles by index |
| Change chart SVG rendering/rings | `src/components/ActivityChart.tsx` | consumes `ChartActivity[]`, calls `activityArc` |
| Change upload flow / toasts | `src/components/ActivityTracker.tsx` | owns state, orchestrates parse → process → chart |
| Change PNG export | `src/components/ActivityTracker.tsx` `downloadChart` | dynamic `import('html2canvas')`, pads clone height for descenders |
| Add a route | `src/App.tsx` | add above the catch-all `*` route |
| Change prerendered SEO output | `scripts/prerender.mjs`, `src/entry-server.tsx` | |
| Regenerate the OG share image | `node scripts/generate-og.mjs` | writes `public/og-image.png` |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `processActivities` | function | `src/lib/schedule.ts` | Activity[] → ProcessedActivity[]; drops unparseable/zero-length rows, resolves overnight wraparound |
| `activityArc` | function | `src/lib/chart-geometry.ts` | ProcessedActivity → SVG arc path + label placement |
| `toChartActivities` | function | `src/lib/chart-activity.ts` | ProcessedActivity[] → ChartActivity[], assigns palette color |
| `parseActivityFile` | function | `src/lib/parse.ts` | File → Activity[]; CSV split directly, else dynamic `import('xlsx')` |
| `rowsToActivities` | function | `src/lib/parse.ts` | shared column resolver for both CSV and Excel adapters |
| `ActivityTracker` | component | `src/components/ActivityTracker.tsx` | top-level state container, orchestrates the pipeline |
| `ActivityChart` | component | `src/components/ActivityChart.tsx` | pure SVG rendering of the dual-ring chart |

## CONVENTIONS
- `@/*` path alias maps to `./src/*` — use it for all internal imports (never relative `../../`).
- `tsconfig.json` has `noImplicitAny: false` and `strictNullChecks: false` — intentional, don't tighten without being asked.
- Large deps (`xlsx`, `html2canvas`) are dynamic-imported at their call site, not top-level, to keep them out of the initial bundle. Follow this pattern for any other heavy, rarely-used dependency.
- `src/lib` modules are pure (no React, no DOM) and each has a colocated `*.test.ts` run via `vitest run` — see `src/lib/AGENTS.md`.
- `src/components/ui/*` is shadcn-generated boilerplate; treat it as vendored, edit app behavior in the components that consume it instead.

## ANTI-PATTERNS (THIS PROJECT)
- Don't add business logic (time parsing, angle math, column resolution) inside components — it belongs in `src/lib` as a pure, independently testable function.
- Don't hand-edit `public/og-image.png` — regenerate it with `node scripts/generate-og.mjs`.

## COMMANDS
```bash
pnpm dev            # dev server, port 8080, host "::"
pnpm build           # vite build + prerender (needs Chromium — see NOTES)
pnpm build:vite       # vite build only, skip prerender
pnpm test              # vitest run
pnpm lint               # eslint .
pnpm deploy              # wrangler deploy --assets=./dist
```

## NOTES
- CLAUDE.md says "there are no tests in this project" — that's stale. `vitest` is wired (`pnpm test`) and `src/lib/*.test.ts` covers schedule, parse, chart-geometry, and chart-activity.
- `pnpm build`'s prerender step needs Chromium: run `npx puppeteer browsers install chrome` once after a fresh `pnpm install`, or use `pnpm build:vite` if Chromium isn't available.
- `npm install`/`yarn` are blocked by a `preinstall` hook (`only-allow pnpm`) — use `pnpm install`.
