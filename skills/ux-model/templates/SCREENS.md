# {Project}: Screen map (the single index of visual targets)

> **Implement from these targets only.** Every screen has exactly ONE target: `{date-feature}/variant-x.html#state`, relative to
> `docs/design/mockups/`. Open it over the mockup server
> (`python -m http.server 8765 --bind 127.0.0.1 --directory docs/design/mockups`) at `http://127.0.0.1:8765/{target}`.
> Contract: `docs/DESIGN_SYSTEM.md`. Data: `docs/design/sample-data.md`. Updated {YYYY-MM-DD}.

## Flow status

| # | Flow (role) | Key jobs | งวด | Target | Decision record | Status |
|---|---|---|---|---|---|---|
| 1 | {flow} | {J1, J2} | {1} | `{date-feature}/variant-a.html` | `{date-feature}/chosen.md` | {⏳ designing · ✅ chosen · 🛠 built} |

## Screens

| Route | Screen | Roles | Objects shown | States (`#id`) | Entry points | Target |
|---|---|---|---|---|---|---|
| `{route}` | {screen name} | {roles} | {objects} | `#{state}` {label} · `#empty` {label} · `#error` {label} | {menu · to-do · notification} | `{date-feature}/variant-a.html#{state}` |

Every state the user can reach is listed — **layout-neutral** until a design is chosen: name the state and its label, not its
container. Once `chosen.md` exists, note the container (page / popup / inline) next to the state.
**This file owns the state ids and labels** (`#id label`): walkthroughs, BRIEFs and mockups use them verbatim; a new state is added here first.

## Built vs. target

When a screen is implemented, note the commit/date and anything added beyond the mockup (and why), so the next designer knows what
is real. Unchosen variants stay in their folder — the chosen file's A/B/C switcher and `compare.html` link to them.
