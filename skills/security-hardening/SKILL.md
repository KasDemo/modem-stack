---
name: security-hardening
description: Use when implementing authentication, authorization, data-access rules, file uploads, webhooks, or any endpoint or client-side query that touches user or personal data. Applies build-time security discipline while the code is being written — input validation, authz on every route, least privilege, secrets handling — not review-time scanning.
---

# Security Hardening (Build-Time)

Treat every external input as hostile, every secret as sacred, and every authorization check as mandatory. Security isn't a phase — it's a constraint on every line of code that touches user data, authentication, or external systems.

**Scope note:** Claude Code's built-in `/security-review` covers review-time — scanning finished changes for vulnerabilities. This skill is the discipline applied *while building*, so `/security-review` finds nothing. Use both: this skill during implementation, `/security-review` (or ship-check) before merge.

## Threat Model First (Five Minutes, Not a Ceremony)

Controls bolted on without a threat model are guesses. Before hardening, think like an attacker:

1. **Map the trust boundaries.** Where does untrusted data cross into the system? HTTP requests, form fields, file uploads, webhooks, third-party APIs, client-side DB writes, LLM output. Every boundary is attack surface.
2. **Name the assets.** What's worth stealing or breaking? Credentials, personal data, admin actions, schedule/payment records.
3. **Run STRIDE over each boundary** — a quick lens:

| Threat | Ask | Typical mitigation |
|---|---|---|
| **S**poofing | Can someone impersonate a user/service? | Authentication, signature verification |
| **T**ampering | Can data be altered in transit or at rest? | Server-enforced rules, parameterized queries, HTTPS |
| **R**epudiation | Can an action be denied later? | Audit logging of security events |
| **I**nformation disclosure | Can data leak? | Field allowlists, generic errors, no PII in logs |
| **D**enial of service | Can it be overwhelmed? | Rate limiting, input size caps, timeouts |
| **E**levation of privilege | Can a user gain rights they shouldn't? | Authorization checks, least privilege |

4. **Write abuse cases next to use cases.** For each feature ask "how would I misuse this?" — then make that your first test.

If you can't name the trust boundaries for a feature, you're not ready to secure it. Most breaches begin in design, not code (OWASP A04: Insecure Design). Record threat notes in the feature's plan under `docs/plans/`; durable security decisions go in `docs/solutions/`.

## The Three-Tier Boundary System

### Always Do (No Exceptions)

- **Validate all external input** at the system boundary (API routes, form handlers, DB rules) — allowlists, length limits, type checks
- **Parameterize all database queries** — never concatenate user input into SQL/queries
- **Encode output** to prevent XSS — use framework auto-escaping (React does this by default); never `dangerouslySetInnerHTML`/`innerHTML` with user data
- **Check authorization on every route and every resource** — authentication says who you are; authorization says what you may touch
- **Use HTTPS** for all external communication
- **Hash passwords** with bcrypt/scrypt/argon2 (≥12 rounds) — only if not delegating auth to Firebase/OAuth (prefer delegating)
- **Use httpOnly, secure, sameSite cookies** for sessions — never auth tokens in localStorage
- **Set security headers** (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
- **Run `npm audit`** against the committed lockfile before every release

### Ask First (Stop and Decide Deliberately — Flag to the Client if It's Their Data)

- Adding new authentication flows or changing auth logic
- Storing new categories of personal or sensitive data
- Adding new external service integrations (each one is a data processor — see PDPA below)
- Changing CORS configuration or DB security rules
- Adding file upload handlers
- Granting elevated permissions or roles

### Never Do

- **Never commit secrets** to version control (API keys, service account JSON, tokens)
- **Never log personal or sensitive data** (passwords, tokens, names, health info)
- **Never trust client-side validation or UI-level role checks** as a security boundary
- **Never use `eval()` or `innerHTML`** with user-provided data
- **Never expose stack traces** or internal error details to users
- **Never `npm audit fix --force`** automatically — preview, read changelogs, test

## Core Build Patterns

### Input Validation at the Boundary

Validate with a schema (zod or equivalent) in the route handler, not scattered through the code. Constrain string lengths, numeric ranges, and enums; reject with 422 and a generic message. File uploads: restrict MIME type via allowlist, cap size, don't trust the extension — check magic bytes if it matters.

### Authorization on Every Route (Prevents IDOR)

```js
// Always check ownership, not just login
app.patch('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await taskService.findById(req.params.id);
  if (task.ownerId !== req.user.id) {
    return res.status(403).json({ error: { code: 'FORBIDDEN' } });
  }
  // ...proceed
});
```

Admin actions verify the admin role **server-side** on each request — a stored `isAdmin` boolean read by the UI is a UX hint, not a control.

### Secrets Handling

```
.env.example   → committed (placeholders only)
.env / .env.local / serviceAccountKey.json → gitignored, never committed
.gitignore must cover: .env, .env.*.local, *.pem, *.key, serviceAccountKey.json
```

Before committing, scan the staged diff (Windows PowerShell / bash):

```powershell
git diff --cached | Select-String -Pattern "password|secret|api_key|token|private_key"
```
```bash
git diff --cached | grep -iE "password|secret|api_key|token|private_key"
```

**If a secret is ever committed, rotate it.** Deleting the line or rewriting history is not enough — assume it's compromised the moment it reaches a remote. Revoke and reissue first, then purge from history. Remember: `NEXT_PUBLIC_*` and any client-bundled env var is public by definition — only put values there that are safe to publish.

### Least Privilege

Every credential, API key, service account, and DB rule gets the minimum scope that makes the feature work. Backend service accounts should not be project owners. API keys restricted by referrer/IP where the provider supports it. If a tool "needs admin to work," that's a design smell — find the narrower grant.

## Client-Side Databases (Firestore, Supabase, etc.)

When the frontend talks to the database directly, **the database's security rules ARE your backend authorization layer.** Anyone can open DevTools and issue arbitrary SDK calls with their own auth token — the UI never saw it, the rules did.

- Default-deny: start every ruleset with deny-all, open collections explicitly.
- Rules must enforce ownership (`request.auth.uid == resource.data.ownerId`) and roles. Read roles from custom claims or an admin-only-writable doc — a role field the user can write to is self-service privilege escalation.
- Validate writes in rules too: field allowlists, types, value constraints. A rule that only checks `request.auth != null` lets any signed-in user write anything.
- Keep rules in the repo (`firestore.rules` or equivalent), review changes like schema migrations, test with the emulator (`npx firebase emulators:start` — cross-platform).
- Anything the client must never be able to do (approve requests, flip admin flags, mutate other users' records) goes through a server endpoint using the Admin SDK — not through cleverer rules.
- Run doubt-check on any claim that "the UI prevents that" — the UI prevents nothing.

## Personal Data and Thailand PDPA

Client apps here are often hospital- or patient-adjacent. Health-related data is **sensitive personal data** under Thailand's PDPA (Section 26) — explicit consent, stricter handling, and PDPC breach notification within 72 hours. Build accordingly:

- **Collect the minimum.** A scheduling app needs names and shifts, not ID-card numbers or diagnoses. Every field of personal data is liability; if the feature works without it, don't store it.
- **Never log personal data.** Names, emails, phone numbers, HN numbers, and health info stay out of `console.log`, server logs, error trackers, and analytics events. Log opaque IDs; join to identity only in the database.
- **Keep personal data out of LLM prompts** and third-party API calls unless the client has explicitly agreed — each external service is a data processor, and Firebase/OpenAI/analytics all mean data leaving Thailand (cross-border transfer). Flag it; don't decide silently.
- **Know where personal data lives.** Keep a short data inventory (which collections/fields hold personal data) in `docs/PRD.md` or `docs/solutions/` — it's what makes deletion requests and breach response feasible instead of archaeology.
- **Design for deletion.** Data-subject rights include erasure and export. Don't scatter personal data across collections, logs, and caches you can't enumerate.

## Inline Security Checklist

Run this while building; ship-check re-verifies before release.

### Authentication
- [ ] Auth delegated to a proven provider, or passwords hashed with bcrypt/scrypt/argon2
- [ ] Session tokens httpOnly, secure, sameSite — not in localStorage
- [ ] Rate limiting on login (≤10 attempts / 15 min); reset tokens time-limited and single-use

### Authorization
- [ ] Every protected endpoint checks authentication AND authorization
- [ ] Resource access checks ownership/role (no IDOR)
- [ ] Admin actions verified server-side (rules or Admin SDK), never UI-only
- [ ] Client-DB security rules default-deny, enforce ownership, validate fields

### Input
- [ ] All user input schema-validated at the boundary (allowlists, lengths, ranges)
- [ ] Queries parameterized; HTML output escaped by the framework
- [ ] File uploads: type allowlisted, size capped, content verified
- [ ] Redirect URLs validated; server-side fetches of user-supplied URLs allowlisted (no SSRF to internal/metadata IPs)

### Data
- [ ] No secrets in code or git history; client-bundled env vars contain nothing secret
- [ ] Sensitive fields excluded from API responses (`passwordHash`, tokens, other users' PII)
- [ ] No personal data in logs, error trackers, or LLM prompts
- [ ] Personal-data inventory current in docs/

### Infrastructure
- [ ] Security headers set (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)
- [ ] CORS restricted to known origins — never `*` with credentials
- [ ] Error responses generic; stack traces and query text never reach the user
- [ ] `npm audit` triaged: critical/high fixed or reachability-justified with a review date; one lockfile, CI uses `npm ci`

### AI / LLM (if the feature calls a model)
- [ ] Model output treated as untrusted input — never into eval/SQL/shell/innerHTML
- [ ] Permissions enforced in code, not in the system prompt; secrets and cross-tenant data kept out of the context window
- [ ] Token, rate, and loop limits set

## OWASP Top 10 Quick Reference

| # | Vulnerability | Prevention |
|---|---|---|
| 1 | Broken Access Control | Authz on every endpoint/rule, ownership verification |
| 2 | Cryptographic Failures | HTTPS, strong hashing, no secrets in code |
| 3 | Injection | Parameterized queries, input validation |
| 4 | Insecure Design | Five-minute threat model, abuse cases |
| 5 | Security Misconfiguration | Headers, default-deny rules, minimal permissions |
| 6 | Vulnerable Components | `npm audit`, minimal deps, review new dependencies |
| 7 | Auth Failures | Proven auth provider, rate limiting, session hygiene |
| 8 | Data Integrity Failures | Locked dependencies, reviewed lockfile diffs |
| 9 | Logging Failures | Log security events; never log secrets or PII |
| 10 | SSRF | Allowlist user-influenced URLs; block private/metadata IPs |

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This is an internal tool, security doesn't matter" | Internal tools get compromised. Attackers target the weakest link. |
| "We'll add security later" | Security retrofitting is 10x harder than building it in. Add it now. |
| "No one would try to exploit this" | Automated scanners will find it. Security by obscurity is not security. |
| "The framework handles security" | Frameworks provide tools, not guarantees. Use them correctly. |
| "It's just a prototype" | Prototypes become production. Security habits from day one. |
| "The UI hides that button from non-admins" | The UI is a suggestion. DevTools talks to your database directly. |
| "It's just LLM output, it's only text" | That "text" can be a SQL statement, a script tag, or a shell command. |
| "It's a small clinic app, PDPA won't come up" | Health data is sensitive personal data by law. Small doesn't mean exempt. |

## Red Flags — Stop and Fix Before Continuing

- User input passed directly into queries, shell commands, or HTML rendering
- Secrets or service-account JSON in source or commit history
- Endpoints or DB collections without authorization checks
- Role/permission fields writable by the user they empower
- Wildcard CORS origins; no rate limiting on auth endpoints
- Personal data appearing in logs, analytics, or prompts
- Stack traces exposed to users
- Server fetching user-supplied URLs without an allowlist

## Done Criteria

Security work on a feature is finished when the inline checklist sections that apply are all checked, the threat notes live in the plan doc, and `/security-review` plus ship-check pass over the final diff. Evidence, not vibes.
