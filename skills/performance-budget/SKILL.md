---
name: performance-budget
description: Use when the user says "slow", "optimize", or "performance"; when a page, table, or API feels sluggish; when Core Web Vitals or bundle size need checking; or at ship time to enforce the performance budget before release. Measure-first discipline — baseline, fix one thing, re-measure, keep or revert.
---

# Performance Budget

## Overview

Measure before optimizing. Performance work without measurement is guessing — and guessing leads to premature optimization that adds complexity without improving what matters. Profile first, identify the actual bottleneck, fix it, measure again. Optimize only what measurements prove matters.

**When NOT to use:** don't optimize before there is evidence of a problem. Premature optimization adds complexity that costs more than the performance it gains.

## Budgets

Core Web Vitals targets (the release gate — `ship-check` runs this table):

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

Default project budget (override per project; record the agreed numbers in `docs/PRD.md` under non-functional requirements):

```
JavaScript bundle:  < 200KB gzipped (initial load)
CSS:                < 50KB gzipped
Images:             < 200KB per above-the-fold image
API response time:  < 200ms (p95)
Lighthouse Performance score: >= 90
```

## The Workflow

```
1. MEASURE  -> Establish baseline with real data
2. IDENTIFY -> Find the actual bottleneck (not assumed)
3. FIX      -> Address the specific bottleneck
4. VERIFY   -> Measure again; keep or revert
5. GUARD    -> Add a script or CI check so it can't silently regress
```

## Step 1: Measure

Use both synthetic tooling (reproducible, good for regression detection) and live probes in the running app (what the user actually feels). All commands below are cross-platform `npx` — they work in PowerShell as-is.

### Synthetic: Lighthouse + bundle analysis

```bash
# Lighthouse against the dev/preview server (requires Chrome installed)
npx lighthouse http://localhost:3000 --output=json --output-path=docs/qa/runs/lh-baseline.json --chrome-flags="--headless"

# Bundle analysis — pick the one matching the project:
# Next.js: install @next/bundle-analyzer, then
npx cross-env ANALYZE=true next build
# Vite:
npx vite-bundle-visualizer
# webpack:
npx webpack-bundle-analyzer stats.json
```

Lighthouse uses simulated throttling — trust it for LCP/bundle findings; INP problems often only surface on slow hardware, so treat a long-task pileup in the probes below as the real INP signal.

### Live probes: Playwright MCP browser tools

`browser_navigate` to the page, then run probes with `browser_evaluate`:

```js
// TTFB + load timing
() => { const [n] = performance.getEntriesByType('navigation');
  return { ttfb: Math.round(n.responseStart), domReady: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), transferKB: Math.round(n.transferSize / 1024) }; }

// LCP (resolves after the last candidate)
() => new Promise(r => { new PerformanceObserver(l => { const e = l.getEntries().at(-1);
  r({ lcpMs: Math.round(e.startTime), element: e.element && e.element.tagName }); })
  .observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => r({ lcpMs: null }), 4000); })

// CLS accumulated over a 2s window
() => { let cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; })
  .observe({ type: 'layout-shift', buffered: true });
  return new Promise(r => setTimeout(() => r({ cls: +cls.toFixed(3) }), 2000)); }

// Long tasks (>50ms) — the main INP lever
() => new Promise(r => { const t = []; new PerformanceObserver(l => t.push(...l.getEntries().map(e => Math.round(e.duration))))
  .observe({ type: 'longtask', buffered: true }); setTimeout(() => r({ longTasksMs: t }), 3000); })
```

To measure a specific slow interaction: arm an event-timing observer with `browser_evaluate`, perform the interaction with `browser_click` / `browser_type`, then read it back:

```js
// 1. Arm (before interacting)
() => { window.__evt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__evt.push({ type: e.name, ms: Math.round(e.duration) }); })
  .observe({ type: 'event', durationThreshold: 16 }); return 'armed'; }
// 2. browser_click / browser_type the slow thing
// 3. Read back — worst 5 interactions
() => window.__evt.sort((a, b) => b.ms - a.ms).slice(0, 5)
```

For ad-hoc timing of app code, wrap it with `performance.now()` in a `browser_evaluate` call. Use `browser_resize` to a mobile viewport (390x844) before probing — budgets apply to mobile, not just your desktop.

### Payload audit: browser_network_requests

After navigating, call `browser_network_requests` and scan for:

- **Total requests and bytes** — a page needing 80 requests to paint has a waterfall problem.
- **Any JSON response over ~500KB** — unbounded fetch smell; the endpoint needs pagination.
- **Many near-identical requests to the same endpoint** — client-side N+1 (one request per row).
- **Uncompressed or unhashed static assets** — missing `Cache-Control` / content hashing.

### Backend

```js
// Simple timing around suspect calls
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');
```

Plus framework request logs and slow-query logging. For Python backends, `time.perf_counter()` around the suspect block does the same job.

### Where to start measuring

```
What is slow?
├── First page load
│   ├── Large bundle?        -> bundle analyzer, check code splitting
│   ├── Slow server (TTFB)?  -> TTFB probe; if >800ms profile backend, queries, caching
│   └── Render-blocking?     -> browser_network_requests: CSS/JS before first paint
├── Interaction feels sluggish
│   ├── Freezes on click?    -> long-task probe; break up tasks >50ms
│   ├── Input lag?           -> re-render storm; check unstable props/state scope
│   └── Animation jank?      -> layout thrashing; animate transform/opacity only
├── Page after navigation
│   ├── Data loading?        -> API timing; look for request waterfalls
│   └── Client rendering?    -> component render time; N+1 fetches per row
└── Backend / API
    ├── One endpoint slow?   -> query log, indexes
    └── All endpoints slow?  -> connection pool, memory, CPU
```

## Step 2: Identify

| Symptom | Likely cause | Investigate with |
|---------|-------------|------------------|
| Slow LCP | Large images, render-blocking resources, slow server | `browser_network_requests`, image sizes |
| High CLS | Images without dimensions, late content, font swap | CLS probe, then load with `browser_take_screenshot` before/after |
| Poor INP | Heavy JS on main thread, large DOM updates | Long-task + event-timing probes |
| Slow API | N+1 queries, missing indexes | Database query log |
| Memory growth | Leaked listeners, unbounded caches | Heap snapshot in DevTools |

Name the bottleneck in one sentence with a number attached ("LCP is 4.1s because the hero image is 1.8MB") before writing any fix. If you can't, go back to Step 1.

## Step 3: Fix the Anti-Patterns

### N+1 queries

```ts
// BAD: one query per task for the owner
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// GOOD: single query with join/include
const tasks = await db.tasks.findMany({ include: { owner: true } });
```

Same pattern client-side: one fetch per rendered row is an N+1. Batch it into one request (or one `Promise.all` with a hard cap).

### Unbounded data fetching

```ts
// BAD: fetch everything, forever
const allTasks = await db.tasks.findMany();

// GOOD: paginated with limits
const tasks = await db.tasks.findMany({
  take: 20, skip: (page - 1) * 20, orderBy: { createdAt: 'desc' },
});
```

### Re-render storms (React)

```tsx
// BAD: new object every render — every child re-renders on every keystroke
function TaskList() {
  return <TaskFilters options={{ sortBy: 'date', order: 'desc' }} />;
}

// GOOD: stable reference
const DEFAULT_OPTIONS = { sortBy: 'date', order: 'desc' } as const;

// React.memo for expensive components, useMemo for expensive computation —
// only where profiling shows benefit. memo/useMemo everywhere is as bad as nowhere.
const Row = React.memo(function Row({ item }: Props) { /* expensive render */ });
```

### Large bundles

```ts
// Dynamic import for heavy, rarely-used features; route-level splitting in Suspense
const ChartLibrary = lazy(() => import('./ChartLibrary'));
```

Modern bundlers tree-shake named imports automatically — the real gains come from splitting and lazy loading, not import-style golf.

### Missing caching

Cache frequently-read, rarely-changed data with a TTL; serve static assets with `maxAge: '1y'` + content-hashed filenames; set `Cache-Control` on cacheable API responses.

### Heavy-table UIs (schedule grids, admin tables)

A monthly schedule grid is people x days x per-cell logic — hundreds to thousands of cells that all want to re-render on every keystroke. Rules:

- **Paginate by month.** Render one month at a time; never mount all history. Fetch the adjacent month on navigation, not upfront.
- **Memoize row renders.** `React.memo` each row keyed by its entity; pass primitive or stable-reference props so an edit in one cell doesn't repaint the grid.
- **Precompute derived maps once** (`date -> holiday`, `person -> requests`) with `useMemo` at the table level — not lookups inside each cell.
- **Keep edit state local to the cell.** Lift it only on commit; a controlled input that writes to table-level state repaints everything per keystroke.
- **Virtualize when rows exceed ~100** (`react-window`). Below that, memoization is the better first lever.
- **Sticky headers via CSS** `position: sticky`, never JS scroll handlers.

## Step 4: Verify (Keep or Revert)

A fix is a hypothesis until you re-measure. This step decides whether it survives.

- **Re-measure the way you measured the baseline.** Same command, same probes, same viewport, same conditions. A baseline on a cold cache against a result on a warm one measures the cache, not your change.
- **Change one thing at a time.** Three optimizations landed together produce one number, and you cannot attribute it.
- **Beat the noise, not just the mean.** Run it a few times. A 3% gain inside ±5% run-to-run variance is not a gain; it is a different sample.

Then decide, strictly:

| Result vs. baseline | Action |
|---|---|
| Past the threshold, tests green | **Keep.** Commit with before/after numbers in the message. |
| Within noise (no measurable change) | **Revert.** |
| Worse | **Revert.** |
| Improved, but a test went red | **Revert.** A regression wearing a win's clothing. |

**Neutral is a revert, not a keep.** The change is already written, throwing it away feels wasteful — so it lands unmeasured, and the codebase accretes complexity that never bought anything. Code you keep, you maintain forever. Make it pay for itself.

**Correctness gates the metric.** An "optimization" that wins by dropping work the product needed — skipping a validation, caching something that must be fresh, removing a load-bearing `await` — is a regression, not a win. Run `browser-verification` on the affected flows after any keep.

### Log every attempt, including the reverted ones

Reverted work leaves no trace in git history — which is exactly why the same dead idea gets tried again next quarter. Keep a ledger at `docs/solutions/perf-ledger.md`:

```markdown
| Date | Idea | Baseline -> Result | Verdict | Why |
|---|---|---|---|---|
| 2026-08-13 | Memoize row component | INP 240ms -> 235ms | reverted | Inside noise (±15ms). Rows weren't the bottleneck. |
| 2026-08-13 | Virtualize the list | INP 240ms -> 90ms | kept | Long tasks gone from the trace. |
```

Read the ledger before proposing an experiment; don't re-run one that already failed. Promote recurring insights with the `lesson` skill.

## Step 5: Guard

Make the budget enforceable without you remembering:

```jsonc
// package.json — cross-platform npm scripts
"scripts": {
  "perf:lh": "lighthouse http://localhost:3000 --output=json --output-path=docs/qa/runs/lh-latest.json --chrome-flags=\"--headless\"",
  "perf:bundle": "bundlesize"
}
```

- `npx bundlesize` (with `bundlesize.config.json`) fails the build when a chunk exceeds budget.
- `npx lhci autorun` in CI compares Lighthouse scores against thresholds.
- At minimum: `ship-check` runs `perf:lh` and compares against the budget table before any release.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll optimize later" | Performance debt compounds. Fix obvious anti-patterns now; defer micro-optimizations. |
| "It's fast on my machine" | Your machine isn't the user's. Probe at mobile viewport; trust Lighthouse throttling. |
| "This optimization is obvious" | If you didn't measure, you don't know. Profile first. |
| "It didn't help much, but it doesn't hurt" | Neutral changes are a revert. You pay maintenance forever and got nothing back. |
| "We already wrote it, may as well keep it" | Sunk cost. The measurement doesn't care how long the change took to write. |
| "The improvement is obvious, no need to re-measure" | Then re-measuring is cheap and proves it. Unmeasured wins are how neutral complexity lands. |

## Red Flags

- Optimization without profiling data to justify it
- N+1 patterns in data fetching (server queries or per-row client fetches)
- List endpoints without pagination; tables that mount all history
- Images without dimensions, lazy loading, or responsive sizes
- `React.memo` / `useMemo` sprinkled everywhere without a profile
- Several optimizations bundled into one measurement — nothing attributable
- A "win" that required a test to be changed, skipped, or deleted
- The same failed optimization attempted twice because nobody wrote down the first attempt

## Verification Checklist

- [ ] Before and after measurements exist (specific numbers, saved probe output or Lighthouse JSON in `docs/qa/runs/`)
- [ ] Result was re-measured the same way as the baseline
- [ ] Improvement exceeds run-to-run variance
- [ ] Neutral or worse changes were reverted, not kept
- [ ] Every attempt logged in `docs/solutions/perf-ledger.md`, kept and reverted alike
- [ ] Core Web Vitals within "Good" thresholds; budget table passes
- [ ] Bundle size did not grow without review
- [ ] No new N+1 or unbounded fetches
- [ ] Existing tests still pass and affected flows verified in the browser
