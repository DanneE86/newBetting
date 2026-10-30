// Knappen "Läs travsport-historik" på fliken Hästar: kör scripts/fetch-travsport-hast.mjs i bakgrunden för en avdelning
// eller hela omgången och följer utskriften, så att GUI:t kan visa förloppet. En körning åt gången. Bara lokalt.
import path from "node:path";
import { spawn } from "node:child_process";
import { validHorseId } from "./travsport-history.mjs";

let current = null;
let child = null;
export const historyJob = () => (current ? { ...current, errors: [...current.errors] } : null);

export function cancelHistoryJob() {
  if (current?.status === "running") {
    current.cancelRequested = true;
    child?.kill();
  }
  return historyJob();
}

/** En rad från fetch-travsport-hast.mjs → { id, kind: "fetched" | "cached" | "error", message } eller null. */
export function parseLine(line) {
  let m = line.match(/^Sparade data[\\/]hastar[\\/]travsport[\\/](ts\d+)\.json/);
  if (m) return { id: m[1], kind: "fetched" };
  m = line.match(/^(ts\d+) finns redan/);
  if (m) return { id: m[1], kind: "cached" };
  m = line.match(/^(ts\d+): (.+), hoppar över$/);
  if (m) return { id: m[1], kind: "error", message: m[2] };
  if (/robotkontroll/i.test(line)) return { id: null, kind: "error", message: line.trim() };
  return null;
}

/**
 * Startar läsningen. analysis: sparad analys (races med horses: horseId, horse). leg: avdelning eller null = alla.
 * force: läs om redan sparade hästar (--igen). run(args) → barnprocess (för test), annars node-processen.
 */
export function startHistoryJob(root, analysis, { leg = null, force = false, run = null } = {}) {
  if (current?.status === "running") throw new Error("En historikläsning pågår redan.");
  if (!analysis?.races) throw new Error("Ingen sparad omgång finns att läsa historik för.");
  const races = leg == null ? analysis.races : analysis.races.filter((r) => r.leg === leg);
  if (!races.length) throw new Error("Avdelningen finns inte.");
  const horses = [
    ...new Map(
      races.flatMap((r) => r.horses.filter((h) => !h.scratched && validHorseId(h.horseId)).map((h) => [`ts${h.horseId}`, { ...h, leg: r.leg, raceNumber: r.number }])),
    ).values(),
  ];
  if (!horses.length) throw new Error("Hästarna saknar häst-ID.");
  const byId = new Map(horses.map((h) => [`ts${h.horseId}`, h]));
  const job = (current = {
    id: `${Date.now()}`,
    gameId: analysis.id,
    status: "running",
    total: horses.length,
    done: 0,
    fetched: 0,
    cached: 0,
    currentHorse: null,
    currentLeg: null,
    currentRaceNumber: null,
    errors: [],
    startedAt: new Date().toISOString(),
  });
  const args = [...byId.keys(), ...(force ? ["--igen"] : [])];
  const proc = (child = run
    ? run(args)
    : spawn(process.execPath, [path.join(root, "scripts", "fetch-travsport-hast.mjs"), ...args], { cwd: root, env: process.env, windowsHide: true }));
  let buf = "";
  const onLine = (line) => {
    const opening = line.match(/sportinfo\/horse\/(ts\d+)\/results/);
    if (opening && byId.has(opening[1])) {
      const h = byId.get(opening[1]);
      Object.assign(job, { currentHorse: h.horse, currentLeg: h.leg, currentRaceNumber: h.raceNumber });
    }
    const r = parseLine(line);
    if (!r) return;
    const h = r.id ? byId.get(r.id) : null;
    if (r.kind === "fetched") job.fetched++;
    if (r.kind === "cached") job.cached++;
    if (r.kind === "error") job.errors.push({ horse: h?.horse || job.currentHorse || "", message: String(r.message).slice(0, 500) });
    if (h) job.done++;
  };
  const feed = (b) => {
    buf += String(b);
    const lines = buf.split(/\r?\n/);
    buf = lines.pop();
    lines.forEach(onLine);
  };
  proc.stdout?.on("data", feed);
  // stderr: skriptets avbrottsorsak (t.ex. robotkontrollen) eller ett fel i Node
  proc.stderr?.on("data", (b) => {
    for (const l of String(b).split(/\r?\n/).filter((x) => x.trim())) {
      if (parseLine(l)) onLine(l);
      else job.errors.push({ horse: job.currentHorse || "", message: l.trim().slice(0, 500) });
    }
  });
  proc.on("error", (e) => job.errors.push({ horse: "", message: e.message }));
  proc.on("close", (code) => {
    if (buf) onLine(buf);
    job.status = job.cancelRequested ? "cancelled" : code !== 0 ? "failed" : job.errors.length || job.done < job.total ? "partial" : "complete";
    job.currentHorse = null;
    job.endedAt = new Date().toISOString();
    child = null;
  });
  return historyJob();
}
