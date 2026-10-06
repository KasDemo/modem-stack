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

  // UX model: only for projects with UI (a design folder or a design system). A file still holding template
  // placeholders ({object}, {role}, …) or nearly empty counts as missing.
  if (has("docs/design") || has("docs/DESIGN_SYSTEM.md")) {
    const files = ["OBJECTS.md", "WORKFLOWS.md", "SCREENS.md", "sample-data.md"];
    const stub = (f) => {
      const p = path.join(cwd, "docs/design", f);
      if (!fs.existsSync(p)) return true;
      const t = fs.readFileSync(p, "utf8");
      return t.length < 300 || /\{(Project|object|role|job|route|screen name|YYYY-MM-DD)\}/.test(t);
    };
    const missing = files.filter(stub);
    if (missing.length === files.length) {
      lines.push("- No UX model yet (docs/design/OBJECTS.md, WORKFLOWS.md, SCREENS.md, sample-data.md): before Medium/Large UI design, run modem-stack:ux-model — slice first (only what the round touches).");
    } else {
      lines.push("- UX model: docs/design/OBJECTS.md, WORKFLOWS.md, SCREENS.md, sample-data.md. Read the relevant part before UI work; update it in the same change." + (missing.length ? ` Missing or still a template: ${missing.join(", ")}.` : ""));
    }
  }

  const ds = path.join(cwd, "docs/DESIGN_SYSTEM.md");
  if (fs.existsSync(ds) && !/:root\s*\{[^}]*--/.test(fs.readFileSync(ds, "utf8"))) {
    lines.push("- docs/DESIGN_SYSTEM.md is still a stub (no :root tokens): any UI work runs design-first-ui SYSTEM mode first.");
  }

  // Untracked images only: a committed logo.png in the root is not a stray.
  let tracked = new Set();
  try {
    tracked = new Set(execSync("git ls-files", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split(/\r?\n/));
  } catch {}
  const ignored = (f) => {
    try { execSync(`git check-ignore -q "${f}"`, { cwd, stdio: "ignore" }); return true; } catch { return false; }
  };
  const strays = fs.readdirSync(cwd).filter(
    (f) => (f === ".playwright-mcp" && !ignored(f)) || (/\.(png|jpe?g|webp)$/i.test(f) && !tracked.has(f) && !ignored(f))
  );
  if (strays.length) {
    lines.push(
      `- Playwright output is in the repo root (${strays.join(", ")}). Tell the owner and fix the cause per browser-verification's artifact table (PLAYWRIGHT_MCP_OUTPUT_DIR missing, or relative screenshot paths); move or delete files only with the owner's OK.`
    );
  }

  try {
    const mcp = JSON.parse(fs.readFileSync(path.join(cwd, ".mcp.json"), "utf8"));
    if (mcp && mcp.mcpServers && mcp.mcpServers.playwright) {
      lines.push("- This project's .mcp.json defines its own `playwright` server, duplicating the Playwright plugin (same browser profile → \"Browser is already in use\"). Tell the owner; remove it with their OK and re-point agent tools to mcp__plugin_playwright_playwright__*.");
    }
  } catch {}

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join("\n") },
  }));
}

let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => { try { main(input); } catch {} });
