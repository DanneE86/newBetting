// PreToolUse-krok (.claude/settings.json): ägda filer (config/agare.json) får bara ändras av sin ägarsession.
// Andra Claude-sessioner nekas Edit/Write på filerna, skal-kommandon som skriver, tar bort eller återställer dem,
// och git add/commit/stash/checkout/restore som skulle ta med eller skriva över dem. config/agare.json ändrar bara användaren.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const AGARE_FIL = "config/agare.json";

const globRe = (g) =>
  new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\0").replace(/\*/g, "[^/]*").replace(/\0/g, ".*")}$`, "i");

/** Repo-relativ sökväg med snedstreck, eller null om filen ligger utanför repot. */
export function relPath(p, root = ROOT) {
  if (!p) return null;
  const abs = path.isAbsolute(p) ? p : path.join(root, p);
  const rel = path.relative(root, abs).replace(/\\/g, "/");
  return rel.startsWith("..") || path.isAbsolute(rel) ? null : rel;
}

/** Området som äger filen (rel) och som sessionen inte äger, annars null. */
export function lockedArea(rel, cfg, session) {
  if (!rel) return null;
  if (rel.toLowerCase() === AGARE_FIL) return { namn: "ägarskap", agent: "användaren" };
  for (const [namn, o] of Object.entries(cfg.omraden || {})) {
    if (o.agent === session) continue;
    if (o.filer.some((g) => globRe(g).test(rel))) return { namn, agent: o.agent };
  }
  return null;
}

const WRITE = /(^|[^<>=!-])>{1,2}(?!&)|\bsed\s+(-\w*\s+)*-i|\btee\b|write(File|Sync)|appendFile|\b(rm|mv|cp|truncate|touch|unlink)\b|Set-Content|Out-File|Add-Content|Clear-Content|Remove-Item|Move-Item|Copy-Item|Rename-Item|New-Item|git\s+(checkout|restore|reset|stash|rm|mv|apply|clean)\b/i;
const GIT_BROAD = /\bgit\s+(add\s+(-A|--all|-u|\.(\s|$)|\*)|add\s+.*\s\.(\s|$)|commit\b.*\s-(?!-)[a-zA-Z]*a[a-zA-Z]*\b|stash\b|checkout\s+(\S+\s+)?--\s+\.|checkout\s+\.(\s|$)|restore\s+(.*\s)?\.(\s|$)|reset\s+--hard|clean\b)/i;
const GIT_COMMIT = /\bgit\s+commit\b/i;

/** Beslut för ett verktygsanrop. git = { modified(): string[], staged(): string[] }. Returnerar skäl att neka eller null. */
export function decide({ tool, input, session }, cfg, git, root = ROOT) {
  const why = (rel, a) =>
    `${rel} tillhör området "${a.namn}" (${a.agent === "användaren" ? "bara användaren ändrar ägarskap" : `ägs av session ${a.agent.slice(0, 8)}`}). ` +
    `Den här sessionen får inte ändra, återställa, stagea eller committa filen – lämna den åt ägaren eller be användaren byta ägare i ${AGARE_FIL}.`;
  if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
    const rel = relPath(input.file_path || input.notebook_path, root);
    const a = lockedArea(rel, cfg, session);
    return a ? why(rel, a) : null;
  }
  if (tool !== "Bash" && tool !== "PowerShell") return null;
  // omdirigering till /dev/null, $null eller 2>&1 skriver inget
  const cmd = String(input.command || "").replace(/\d?>{1,2}\s*(\/dev\/null|\$null|nul\b)|\d>&\d/gi, " ");
  const norm = cmd.replace(/\\/g, "/");
  // ägarfilen får stageas och committas (bara innehållet är låst), ägda områden inte
  const owned = (list) => list.filter((rel) => rel.toLowerCase() !== AGARE_FIL).map((rel) => [rel, lockedArea(rel, cfg, session)]).find(([, a]) => a);
  // nämner kommandot en låst fil och skriver/tar bort/återställer?
  const words = norm.match(/[^\s"'`;|&()<>]+/g) || [];
  for (const w of words) {
    const rel = relPath(w.replace(/^\.\//, ""), root);
    const a = rel && /[./]/.test(w) ? lockedArea(rel, cfg, session) : null;
    if (a && (WRITE.test(cmd) || (a.namn !== "ägarskap" && /\bgit\s+(add|commit)\b/i.test(cmd)))) return why(rel, a);
  }
  // breda git-kommandon (add -A, add ., commit -a, stash, checkout -- ., restore ., reset --hard, clean)
  if (GIT_BROAD.test(cmd)) {
    const hit = owned(git.modified());
    if (hit) return why(hit[0], hit[1]);
  }
  if (GIT_COMMIT.test(cmd)) {
    const hit = owned(git.staged());
    if (hit) return why(hit[0], hit[1]);
  }
  return null;
}

function gitList(...a) {
  const r = spawnSync("git", a, { cwd: ROOT, encoding: "utf8" });
  return r.status === 0 ? r.stdout.split("\n").map((s) => s.trim()).filter(Boolean) : [];
}

function main() {
  let ev;
  try { ev = JSON.parse(fs.readFileSync(0, "utf8")); } catch { return; }
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(path.join(ROOT, AGARE_FIL), "utf8")); } catch { return; }
  const git = {
    modified: () => [...new Set([...gitList("diff", "--name-only"), ...gitList("diff", "--cached", "--name-only"), ...gitList("ls-files", "--others", "--exclude-standard")])],
    staged: () => gitList("diff", "--cached", "--name-only"),
  };
  const reason = decide({ tool: ev.tool_name, input: ev.tool_input || {}, session: ev.session_id }, cfg, git);
  if (reason) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason } }));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
