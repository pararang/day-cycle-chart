---
target: the home page (ActivityTracker surface)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:/private/tmp/day-cycle-chart/src/components/ActivityTracker.tsx"
target_fingerprint: "sha256:98a31c18d93e2f5910864a33fd575799f163b9ae2e0fc337188230ea6a6013fb"
target_path: /private/tmp/day-cycle-chart/src/components/ActivityTracker.tsx
timestamp: 2026-09-29T06-44-03Z
slug: src-components-activitytracker-tsx
---
# Impeccable Critique — Clock Chart (day-cycle-chart)

**Method: dual-agent (A: st_01a0ebda design review · B: st_01a0ebdb detector/browser evidence).**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Solid: upload Loader, download loading, toasts. Missing: no parse progress on large files. |
| 2 | Match System / Real World | 2 | 12-hour clock face for 24-hour data forces mental AM/PM mapping. |
| 3 | User Control and Freedom | 2 | No way to remove/replace a file without reload; no undo; only Full-Width toggle. |
| 4 | Consistency and Standards | 2 | Sample-CSV "take a look" vs "download" use two different mechanisms; native file-input chrome vs Kumo Button vocabulary. |
| 5 | Error Prevention | 3 | accept filter + caught parse errors; missing size limit and no parsed-data preview. |
| 6 | Recognition Rather Than Recall | 2 | Ring meaning must be remembered; no tooltip on slices; colors carry no meaning. |
| 7 | Flexibility and Efficiency of Use | 1 | No shortcuts, drag-drop, paste, URL sharing, or re-upload flow. |
| 8 | Aesthetic and Minimalist Design | 2 | Page ~2465px tall; SEO text wall dominates below the chart. |
| 9 | Error Recovery | 3 | Error toasts + console.error; generic message, no row/column detail. |
| 10 | Help and Documentation | 3 | SeoContent inline help is good but below the fold, not before upload. |
| **Total** | | **23/40** | **C+ — functional but unauthored** |

## Design Specificity Verdict

**Category-interchangeable.** The only authored design decision is the white→teal radial-gradient background; everything else is template-default. No brand mark, no time metaphor on the rings, no semantic color (no dawn/dusk/sleep encoding), a raw native file input, Kumo's stock Empty, and a footer crediting "Designed by Lovable." The dual-ring 24-hour concept is the product's core insight but it is explained with one muted line and two 14px icons.

**Deterministic scan:** Inconclusive — the detector binary (v0.1.6) returned `[]` for every target, including a synthetic probe deliberately embedding known anti-patterns, so it produces no output in this environment. Zero findings here is not evidence of cleanliness.

**Browser evidence (B):** 0 console/page errors across empty, populated, and post-download states. Chart SVG has correct `role="img"` + aria-label. Heading order is valid except a toast-injected H2 that lands after the H3s. No horizontal overflow at desktop or mobile. Flow (upload→toast→chart→download) works.

## Overall Impression

A genuinely clever dual-ring overnight-charting concept rendered as a generic dashboard card. The pipeline is sound and privacy-first messaging is right, but the presentation, interaction, and one data-accuracy bug (30-min activities show "1h") keep it at "competent scaffold." The single biggest opportunity: make the chart itself interactive and let the 24-hour cycle be visible in the design.

## What's Working

1. **Dual-ring overnight handling** — inner day / outer night split cleanly solves the wrap-midnight problem that defeats linear timelines.
2. **Privacy-first reassurance** — "nothing is sent to a server" is concrete, true, and well-placed for a schedule-upload tool.
3. **Robust export** — html-to-image handles Tailwind v4 oklch; capture logic restores truncate/padding so legend text is fully exported.

## Priority Issues

### [P0] Duration display rounds 30-minute activities to "1h"
- **What:** `Math.round(activity.duration / 60)` shows 30m as "1h" and 8.5h as "9h" (confirmed live: Mandi 1h, Ngantor 9h).
- **Why:** A time-tracking tool showing wrong durations defeats its purpose.
- **Fix:** Format `Xh Ym` (or decimal), e.g. `${h}h${m?` ${m}m`:''}`.
- **Command:** harden

### [P1] No tooltip/tap interaction on chart slices
- **What:** Slices only dim on hover; TooltipProvider is wired in App.tsx but unused.
- **Why:** Users can't identify a slice without color-matching against the below-the-fold legend.
- **Fix:** Add a Kumo Tooltip / SVG `<title>` per slice with name, time range, duration; wire the existing provider.
- **Command:** clarify

### [P2] 12-hour clock face for 24-hour data creates AM/PM ambiguity
- **What:** Numerals 1–12; each maps to two possible hours (inner=AM, outer=PM) with nothing to disambiguate.
- **Fix:** 24-hour cardinal labels (0/6/12/18) or per-ring AM/PM or a time-of-day color gradient.
- **Command:** clarify

### [P2] Sample-CSV pattern is confusing (two mechanisms, one intent)
- **What:** "take a look" opens raw CSV text in a new tab; "download" fetches a blob. Different verbs/outcomes for the same goal; first-timers hit the raw-text dead end.
- **Fix:** Single "Download sample CSV"; drop "take a look" or make it an in-page preview.
- **Command:** distill

### [P2/P3] Green status text fails WCAG AA (detector-level finding)
- **What:** `text-green-600` status line measures 3.22:1 at 12px — below the 4.5:1 AA minimum. Also: the toast injects an H2 out of order, and the Download button exposes no `aria-busy` during export.
- **Fix:** Darken green (e.g. green-700/800), use aria-live on the toast heading, and set `aria-busy` on the Download button during export.
- **Command:** audit

### [P3] 404 page is bare and off-brand
- **What:** Plain "404 / Oops! / Return to Home" with no card, icon, gradient, or footer.
- **Fix:** Reuse the page chrome (LayerCard + Clock icon + gradient + footer).
- **Command:** polish

## Persona Red Flags

- **Alex (power user):** no drag-and-drop or data preview; can't see which column was unrecognized; duration rounding misleads; slices aren't clickable; downloads overwrite (no timestamp).
- **Jordan (first-timer):** "take a look" opens raw CSV with no context; ring concept explained once in muted 14px text with no diagram; chart labels illegible in the exported PNG.

## Minor Observations

- Sample-link row is fragile inline composition that wraps mid-phrase on narrow widths.
- Footer QR comes from a third-party API (api.qrserver.com); broken-image risk.
- Footer's empty left div is leftover.
- SeoContent shows the how-to even after upload — a task the user already did.
- Chart has a good aria-label but slices have no per-slice aria-label/title.
- Empty-state Upload badge is tiny (16px) against the 64px clock.
- ArrowsIn/ArrowsOut imply fullscreen, not chart-width; FrameCorners is more accurate.

## Questions to Consider

- Why does a 24-hour clock show 12-hour numerals?
- Why is the SEO text still visible after the user has already done the task?
- Why is the chart's TooltipProvider wired but unused?
- Is the dual-link sample pattern a symptom of design-by-committee?
- What if it were designed for one specific user (shift worker, student) instead of "everyone with a schedule"?
