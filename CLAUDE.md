# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # Start dev server on port 8080 (host "::")
pnpm build         # Production build to /dist
pnpm build:dev     # Build in development mode (enables lovable-tagger)
pnpm lint          # Run ESLint
pnpm preview       # Preview production build locally
pnpm deploy        # Deploy /dist to Cloudflare Workers static assets (requires wrangler auth)
```

There are no tests in this project.

This repo enforces **pnpm** — `npm install`/`yarn` are blocked by a `preinstall` hook (`only-allow pnpm`) and `engine-strict=true`. Use `pnpm install`.

## Architecture

Vite + React + TypeScript SPA. Styling via Tailwind CSS and shadcn/ui. Deployed to Cloudflare Pages.

**Component responsibilities:**
- `ActivityTracker.tsx` — top-level state container. Owns parsed activity data, chart display options (fullWidth toggle), and orchestrates file parsing.
- `ActivityChart.tsx` — pure SVG rendering. Receives `ProcessedActivity[]` and draws the dual-ring 24-hour clock chart.
- `FileUpload.tsx` — handles file selection and triggers parsing callback. Also provides a sample CSV download.
- `ChartControls.tsx` — fullWidth toggle and PNG download button (html2canvas).

## Core Data Pipeline

```
CSV/Excel file
  → XLSX.read() (ActivityTracker)
  → processActivities()
      timeToMinutes()    HH:MM or HH.MM → minutes since midnight
      timeToAngle()      minutes → SVG degrees (0° = 12 o'clock, clockwise)
      getZone()          "inner" (6AM–6PM) | "outer" (6PM–6AM)
  → ProcessedActivity[]
  → ActivityChart (SVG arc rendering)
```

Expected CSV columns: `activity` (or `label`), `start`, `end` — case-insensitive. Times are 24-hour format.

## SVG Clock Chart

- Two concentric rings: inner = daytime (6AM–6PM), outer = nighttime (6PM–6AM)
- Each activity renders as an SVG arc path with rotated text at the arc midpoint
- 24-hour wraparound is handled: if `endTime < startTime`, 24h is added to `endMinutes`
- SVG default origin is 3 o'clock; all angles are offset by −90° to place 12 at top

## Path Alias

`@/*` maps to `./src/*`. Use this for all internal imports.

## Type Safety Note

`tsconfig.json` has `noImplicitAny: false` and `strictNullChecks: false`. The project is intentionally loosely typed — don't enforce strict types unless the user requests it.
