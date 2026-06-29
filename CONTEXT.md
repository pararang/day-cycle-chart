# Domain Context

Shared vocabulary for the day-cycle-chart codebase. Use these terms in code,
comments, and architecture discussions so names line up with concepts.

## Terms

- **Activity** — one raw schedule entry as it arrives from a CSV/Excel file:
  a label plus a `start` and `end` time string (24-hour, `HH:MM` or `HH.MM`).

- **Schedule** — a set of Activities for a single 24-hour day.

- **Processed Activity** — an Activity reduced to chart-ready *schedule facts*:
  `name`, `startMinutes`, `endMinutes`, `duration`, and `zone`. Carries no
  rendering concerns (no colors, no angles, no SVG coordinates).

- **Schedule core** (`src/lib/schedule.ts`) — the pure module that turns raw
  Activities into Processed Activities. No React, no SVG. Owns time parsing,
  overnight wraparound, duration, and zone assignment.

- **File parsing** (`src/lib/parse.ts`) — reads an uploaded CSV/Excel file into
  raw Activities. CSV and Excel are two adapters that both funnel into one
  column resolver (`rowsToActivities`), so header matching is case- and
  whitespace-insensitive identically for either format. The `activity` column
  also accepts `label` as an alias. Missing required columns throw; rows with a
  blank required cell are dropped.

- **Zone** — which ring an Activity sits on. `inner` = daytime ring (6AM–6PM),
  `outer` = nighttime ring (6PM–6AM). Assigned from the activity's start time.

- **Overnight wraparound** — when an Activity's end time is earlier than its
  start (e.g. `23:30 → 06:00`), 24 hours are added to the end so `endMinutes`
  stays greater than `startMinutes`. Resolved once, in the Schedule core.

- **Arc geometry** (`src/lib/chart-geometry.ts`) — the pure module that maps a
  Processed Activity to the SVG arc path and label placement for its ring. Owns
  minutes→angle conversion, ring radii, the large-arc flag, and label rotation.
  No React. The view (`ActivityChart`) consumes its output and adds color, font,
  and text content.

- **Chart Activity** — a Processed Activity plus a palette `color`, the shape the
  chart renders. Arc geometry is derived from it on the fly, not stored on it.

## Invariants

- Times are 24-hour, `HH:MM` or `HH.MM`. Hours 0–23, minutes 0–59. An optional
  bare hour (`9`) means `9:00`.
- A Processed Activity always has `endMinutes > startMinutes`.
- Rows with an unparseable time, or with equal start and end, are **dropped** by
  the Schedule core (a row from 09:00 to 09:00 is treated as a data error, not a
  24-hour activity). Callers detect drops via the count difference.
