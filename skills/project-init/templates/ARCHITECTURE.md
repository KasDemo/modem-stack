# {Project}: Architecture and runbook

> How the system is built, why, and how to run, deploy, roll back, back up and restore it. CLAUDE.md links here instead of
> repeating the stack. The runbook half doubles as an installation/backup manual (which TORs often require). Updated {YYYY-MM-DD}.

## 1. Stack (versions verified {YYYY-MM-DD})

| Layer | Choice | Version | Why (one line) |
|---|---|---|---|
| {UI framework} | {…} | {x.y} | {…} |
| {UI components} | {e.g. shadcn/ui} | | |
| {DB} | | | |
| {Auth} | | | |
| {Testing} | {unit / E2E} | | |

## 2. System overview

{3–6 lines or a small mermaid diagram: users → app → DB, jobs, external systems (LDAP, SMTP, finance API).}

| External system | How we talk to it | In dev/test we use |
|---|---|---|
| {e.g. LDAP} | {bind only} | {test double / seed accounts} |

Data model: {path to schema file — the schema is the truth; no hand-drawn ERD. Before it exists, a short "proposed shape" list of tables/keys is fine; delete it once the schema file lands}.

## 3. Decisions

Hard-to-reverse choices with real trade-offs. Long ones get their own file in `docs/adr/` and a link here.

| ID | Decision | Why | Rejected | Date |
|---|---|---|---|---|
| D-01 | {decision} | {reason} | {option — why not} | {date} |

## 4. Real vs. mock today

| Area | State | Note |
|---|---|---|
| {feature/integration} | {real / mock / not started} | |

## 5. Runbook

### Environments
| Env | URL | Host | Notes |
|---|---|---|---|

Env vars: names only, values in `.env.example` / the host — never secrets here.

### Run locally
{exact commands}

### Deploy
{exact commands, in order, including migrations}

### Roll back
{exact commands — app and database} · Last tested: {date}

### Backup
{what, where, schedule, retention}

### Restore
{exact steps} · **Last restore drill: {date} — evidence: {link}**. A backup that has never been restored does not count.

### Scheduled jobs · logs · health
{cron/jobs, where logs are, health URL}

### First checks when something breaks
{3–6 lines}
