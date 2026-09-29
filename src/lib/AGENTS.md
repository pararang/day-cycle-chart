# src/lib

## OVERVIEW
Pure domain logic for the schedule → chart pipeline. No React, no DOM. Read `CONTEXT.md` (repo root) for the vocabulary (Activity, ProcessedActivity, Zone, Chart Activity) before editing here.

## WHERE TO LOOK
| Task | File |
|------|------|
| Time parsing, zone assignment, overnight wraparound | `schedule.ts` (`processActivities`) |
| CSV/Excel column resolution, file reading | `parse.ts` (`rowsToActivities`, `parseActivityFile`) |
| Palette color assignment | `chart-activity.ts` (`toChartActivities`) |
| SVG arc path / label angle math | `chart-geometry.ts` (`activityArc`) |
| Generic helpers (e.g. `cn` classnames) | `utils.ts` |

## CONVENTIONS
- Every module here is pure: same input → same output, no side effects, no imports from `src/components` or React.
- Each module has a colocated `<name>.test.ts` (vitest). Add or change behavior here → add or update its test in the same PR.
- Dependency direction is one-way: `chart-geometry.ts` and `chart-activity.ts` import `ProcessedActivity` from `schedule.ts`; `schedule.ts` never imports from them.
- Invalid/dropped rows are silent (filtered, not thrown) except missing required columns in `parse.ts`, which throws — callers detect drops via count difference, not an error.

## ANTI-PATTERNS
- Don't reach into `File`/DOM APIs outside `parse.ts` — it's the one module allowed to touch `FileReader`.
- Don't store derived geometry (angles, SVG coordinates) on `ChartActivity` — `chart-geometry.ts` derives it on demand from schedule facts.

## NOTES
- Time strings accepted: `HH:MM`, `HH.MM`, or a bare hour (`9` → `9:00`) — see `TIME_PATTERN` in `schedule.ts`. Extending the accepted formats means updating that one regex, not adding parsing elsewhere.
- `chart-activity.ts`'s `COLORS` palette cycles by index once activities exceed its length — add more entries there rather than introducing a second palette.
- Run just this directory's tests: `pnpm test -- src/lib`.
- `utils.ts` only exports `cn` (clsx + tailwind-merge) — a shadcn-standard helper, not app domain logic; don't grow it into a general utility dump.
