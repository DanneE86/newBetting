// Vakt: stoppar commit och publicering när något är trasigt (tömda filer, syntaxfel, trasig JSON,
// halverade filer, ändrade tester utan skäl). Körs av .githooks och publish.yml – utan beroenden.
//
//   node scripts/vakt.mjs                  hela repot (arbetskopian) – samma som npm run vakt
//   node scripts/vakt.mjs --staged         det som ska committas (pre-commit)
//   node scripts/vakt.mjs --tester <fil>   commit-meddelandet: ändrade/borttagna tester kräver "Teständring: <skäl>"
//   node scripts/vakt.mjs --sajt site      den byggda webbversionen (publish.yml, efter bygget)
//
// Krympning: en kodfil som tappar mer än hälften av raderna mot HEAD stoppas. Avsiktligt:
//   VAKT_KRYMPNING=scripts/a.mjs,gui/public/b.js git commit ...
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};

const git = (...a) => {
  const r = spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${a.join(" ")}: ${r.stderr}`);
  return r.stdout;
};
const gitBuf = (...a) => spawnSync("git", a, { cwd: ROOT, maxBuffer: 512 * 1024 * 1024 }).stdout;

export const CODE = /^(scripts|gui|config|\.github)\/.*\.(mjs|js|cjs|json|ts|ps1|yml)$|^package\.json$|^playwright\.config\.ts$/;
export const DOCS = /^(docs\/.*|CLAUDE)\.md$/;
const JS = /\.(mjs|js|cjs)$/;
const MODULE = /^gui\/public\/.*\.js$/; // laddas som <script type="module"> i webbläsaren
const SHRINK_MIN_LINES = 40;

/** Tolkar en JS-fil med node --check. Webbläsarens moduler kopieras till .mjs så att de tolkas som moduler. */
export function syntaxError(file, src, tmp) {
  const ext = MODULE.test(file) ? ".mjs" : path.extname(file);
  const copy = path.join(tmp, file.replace(/[\\/]/g, "__").replace(/\.[^.]+$/, ext));
  fs.writeFileSync(copy, src);
  const r = spawnSync(process.execPath, ["--check", copy], { encoding: "utf8" });
  return r.status === 0 ? null : r.stderr.split("\n").find((l) => /Error/.test(l)) || r.stderr.trim().split("\n")[0];
}

const lines = (buf) => (buf.length ? buf.toString("utf8").split("\n").length : 0);

/** Kontrollerar en uppsättning filer: { file, src (Buffer), head (Buffer|null) }. Returnerar felrader. */
export function checkFiles(files, { allowShrink = [] } = {}) {
  const fel = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vakt-"));
  try {
    for (const { file, src, head } of files) {
      if (src.length === 0) {
        fel.push(`${file}: filen är tom (0 byte)`);
        continue;
      }
      if (JS.test(file) && (CODE.test(file) || file.startsWith("tests/"))) {
        const e = syntaxError(file, src.toString("utf8"), tmp);
        if (e) fel.push(`${file}: syntaxfel – ${e}`);
      }
      if (file.endsWith(".json")) {
        try { JSON.parse(src.toString("utf8").replace(/^﻿/, "")); } catch (e) { fel.push(`${file}: trasig JSON – ${e.message}`); }
      }
      if (head && (CODE.test(file) || DOCS.test(file) || file.startsWith("tests/")) && !allowShrink.includes(file)) {
        const before = lines(head), after = lines(src);
        if (before >= SHRINK_MIN_LINES && after < before / 2) fel.push(`${file}: krympte från ${before} till ${after} rader (VAKT_KRYMPNING=${file} om det är avsiktligt)`);
      }
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return fel;
}

/** Ändrade tester: borttagna rader eller filer i tests/ kräver "Teständring: <skäl>" i meddelandet. test.only stoppas alltid. */
export function checkTestChanges(diff, message) {
  const fel = [];
  const removed = [];
  let file = null;
  for (const l of diff.split("\n")) {
    if (l.startsWith("+++ ")) file = l.slice(6);
    else if (l.startsWith("--- ")) continue;
    else if (l.startsWith("-") && l.slice(1).trim()) removed.push(file || "(okänd)");
    else if (/^\+\s*(test|test\.describe|describe)\.only\(/.test(l)) fel.push(`${file}: test.only får inte committas`);
  }
  const reason = /^Teständring:\s*\S.{5,}/m.test(message || "");
  if (removed.length && !reason) {
    const filer = [...new Set(removed)].join(", ");
    fel.push(`befintliga tester ändrade eller borttagna (${filer}). Tester ändras bara när det verkligen krävs, som sista steg – skriv i commit-meddelandet: "Teständring: <varför testet måste ändras>"`);
  }
  return fel;
}

function staged() {
  const changed = git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z").split("\0").filter(Boolean);
  const inHead = new Set(git("ls-tree", "-r", "--name-only", "-z", "HEAD").split("\0"));
  const files = changed.map((file) => ({ file, src: gitBuf("show", `:${file}`), head: inHead.has(file) ? gitBuf("show", `HEAD:${file}`) : null }));
  // tomma filer någonstans i indexet (även sådana som inte ändras nu)
  const empty = git("ls-files", "-s", "-z").split("\0").filter(Boolean).map((l) => ({ blob: l.split(/\s+/)[1], file: l.split("\t")[1] }))
    .filter((x) => x.blob === "e69de29bb2d1d6434b8b29ae775ad8c2b48c5391" && !changed.includes(x.file));
  return { files, extra: empty.map((x) => `${x.file}: filen är tom (0 byte)`) };
}

function worktree() {
  const tracked = git("ls-files", "-z").split("\0").filter((f) => f && fs.existsSync(path.join(ROOT, f)));
  const modified = new Set(git("diff", "--name-only", "-z", "HEAD").split("\0").filter(Boolean));
  const files = tracked.map((file) => ({
    file,
    src: fs.readFileSync(path.join(ROOT, file)),
    head: modified.has(file) ? gitBuf("show", `HEAD:${file}`) : null,
  }));
  return { files, extra: [] };
}

function site(dir) {
  const abs = path.resolve(ROOT, dir);
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|json|html|css)$/.test(e.name)) out.push(p);
    }
  };
  walk(abs);
  const fel = [];
  if (!fs.existsSync(path.join(abs, "index.html"))) fel.push(`${dir}: index.html saknas`);
  const files = out.map((p) => {
    const rel = path.relative(abs, p).replace(/\\/g, "/");
    return { file: /\.js$/.test(rel) ? `gui/public/${rel}` : rel, src: fs.readFileSync(p), head: null };
  });
  return [...fel, ...checkFiles(files)];
}

function main() {
  let fel;
  if (arg("tester")) {
    const message = fs.readFileSync(path.resolve(ROOT, arg("tester")), "utf8");
    fel = checkTestChanges(git("diff", "--cached", "-U0", "--", "tests"), message);
  } else if (arg("sajt")) {
    fel = site(arg("sajt"));
  } else {
    const { files, extra } = arg("staged") ? staged() : worktree();
    const allowShrink = (process.env.VAKT_KRYMPNING || "").split(",").map((s) => s.trim()).filter(Boolean);
    fel = [...extra, ...checkFiles(files, { allowShrink })];
  }
  if (fel.length) {
    console.error(`\nVAKT STOPPAR (${fel.length}):\n${fel.map((f) => `  ✗ ${f}`).join("\n")}\n`);
    process.exit(1);
  }
  console.log("Vakt: allt ok");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
