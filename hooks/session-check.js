// SessionStart: re-assert the modem-stack routing rules and flag workspace drift.
// Silent outside modem-stack projects. Never fails the session start.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function main(input) {
  let cwd = process.cwd();
  try { cwd = JSON.parse(input).cwd || cwd; } catch {}

  const has = (p) => fs.existsSync(path.join(cwd, p));
  const isModemProject = has("docs/PRD.md") || has("docs/DESIGN_SYSTEM.md") || has("docs/qa/index.md");
  if (!isModemProject) return;

  const lines = [
    "modem-stack project. Routing rules (owner rules, override skill defaults):",
    "- Specs and plans live in docs/plans/, not docs/superpowers/.",
    "- If an approved brainstorming spec adds or visibly changes screens, run modem-stack:design-first-ui BEFORE writing-plans.",
  ];

  const ds = path.join(cwd, "docs/DESIGN_SYSTEM.md");
  if (fs.existsSync(ds) && !/:root\s*\{[^}]*--/.test(fs.readFileSync(ds, "utf8"))) {
    lines.push("- docs/DESIGN_SYSTEM.md is still a stub (no :root tokens): any UI work runs design-first-ui SYSTEM mode first.");
  }

  // Untracked images only: a committed logo.png in the root is not a stray.
  let tracked = new Set();
  try {
    tracked = new Set(execSync("git ls-files", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split(/\r?\n/));
  } catch {}
  const strays = fs.readdirSync(cwd).filter(
    (f) => f === ".playwright-mcp" || (/\.(png|jpe?g|webp)$/i.test(f) && !tracked.has(f))
  );
  if (strays.length) {
    lines.push(
      `- Playwright output is in the repo root (${strays.join(", ")}). Tell the owner and fix the cause per browser-verification's artifact table (PLAYWRIGHT_MCP_OUTPUT_DIR missing, or relative screenshot paths); move or delete files only with the owner's OK.`
    );
  }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join("\n") },
  }));
}

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => { try { main(input); } catch {} });
