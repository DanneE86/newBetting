// Sportinfos tävlingsdagsresultat (sportapp.travsport.se/race/raceday/<ts-id>/results/all).
//
// En sida per tävlingsdag har alla lopp: tempo (första 500, 1000, sista 500 med ledare),
// segermarginal, banförhållande, strukna med orsak, startförbud, bestraffningar och
// domarnas texter ("Nr 8 döms ej för dålig anslutning efter startbilen.").
// Tolkningen sitter i scripts/lib/sportinfo-lopp.mjs.
//
// Vilka dagar: de senaste --antal (standard 5) starterna före omgångens datum för varje häst
// i omgångens samlingsfil (data/hastar/travsport/omgang/<omgång>.json, skrivs av
// fetch-travsport-hast.mjs --omgang). Eller tävlingsdagarnas id direkt.
//
//   node scripts/fetch-sportinfo-lopp.mjs --omgang V85_2026-10-17_16_5
//   node scripts/fetch-sportinfo-lopp.mjs --omgang V85_2026-10-17_16_5,V86_2026-10-21_40_1 --antal 3
//   node scripts/fetch-sportinfo-lopp.mjs ts616672
//
// En sida i taget med paus emellan, som en person som läser. Syns robotkontrollen väntar det
// och laddar om en gång; ligger den kvar avbryts körningen utan fler försök.
// Sparar data/hastar/sportinfo/<ts-id>.json. Datan är upphovsrättsskyddad av Svensk Travsport:
// mappen är gitignorerad och publiceras aldrig.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sleep } from "./lib/http.mjs";
import { isRobotText } from "./lib/travsport-hast.mjs";
import { parseRaceday, racedayIdFrom, racedaysForHorses } from "./lib/sportinfo-lopp.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "hastar", "sportinfo");
const OMGANG = path.join(ROOT, "data", "hastar", "travsport", "omgang");
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const log = (...a) => console.log(...a);
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });

async function paus(min, max, varfor) {
  const ms = min + Math.floor(Math.random() * (max - min + 1));
  log(`${varfor} (${(ms / 1000).toFixed(1)} s)`);
  await sleep(ms);
}

function dagar() {
  const antal = Number(arg("antal")) || 5;
  const ut = new Map();
  const omg = arg("omgang");
  if (omg === true) throw new Error("Ange en omgång efter --omgang");
  for (const id of typeof omg === "string" ? omg.split(",").map((x) => x.trim()).filter(Boolean) : []) {
    const fil = path.join(OMGANG, `${id}.json`);
    if (!fs.existsSync(fil)) throw new Error(`Hittar inte ${path.relative(ROOT, fil)}. Kör fetch-travsport-hast.mjs --omgang ${id} först.`);
    const doc = JSON.parse(fs.readFileSync(fil, "utf8"));
    const lista = racedaysForHorses(doc.hastar || [], { antal, fore: doc.datum });
    log(`${id}: ${lista.length} tävlingsdagar (${antal} senaste starterna per häst)`);
    for (const d of lista) if (!ut.has(d.id)) ut.set(d.id, d.datum);
  }
  for (const a of args) {
    if (a.startsWith("--") || a === omg || a === arg("antal")) continue;
    const id = racedayIdFrom(`raceday/${a}`) || racedayIdFrom(a);
    if (id && !ut.has(id)) ut.set(id, null);
  }
  return [...ut.keys()];
}

async function launch(chromium, dold) {
  const opts = { headless: !!dold };
  try {
    return await chromium.launch({ ...opts, channel: "chrome" });
  } catch {
    return await chromium.launch(opts);
  }
}

const sidtext = (page) => page.evaluate(() => ({ title: document.title || "", body: document.body?.innerText || "" }));

async function hamtaDag(page, id, { igen }) {
  const fil = path.join(DIR, `${id}.json`);
  if (fs.existsSync(fil) && !igen) {
    log(`${id} finns redan, hoppar över`);
    return false;
  }
  const url = `https://sportapp.travsport.se/race/raceday/${id}/results/all`;
  log(`Öppnar ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await paus(3000, 6000, "Sidan får rita klart");
  let vis = await sidtext(page);
  if (isRobotText(vis.title, vis.body.slice(0, 500))) {
    log("Sportinfo visar en kontroll. Väntar och laddar om en gång.");
    await paus(8000, 16000, "Väntar vid kontrollen");
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    await paus(3000, 6000, "Sidan får rita klart");
    vis = await sidtext(page);
  }
  if (isRobotText(vis.title, vis.body.slice(0, 500))) {
    throw new Error("Sportinfo visar fortfarande robotkontroll. Öppna sidan själv i webbläsaren och kör skriptet senare. Körningen avbryts.");
  }
  // Scrolla ner som en läsare så att alla lopp hinner ritas
  for (let i = 0; i < 40; i++) {
    const kvar = await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement;
      const fore = el.scrollTop;
      el.scrollTop = fore + Math.round(el.clientHeight * 0.8);
      return el.scrollTop > fore;
    });
    if (!kvar) break;
    await sleep(300 + Math.floor(Math.random() * 500));
  }
  vis = await sidtext(page);
  const doc = parseRaceday(vis.body, { id, hamtad: today() });
  if (!doc.lopp.length) {
    log(`${id}: inga lopp på sidan, hoppar över`);
    return true;
  }
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(fil, JSON.stringify(doc, null, 2) + "\n");
  log(`Sparade ${path.relative(ROOT, fil)} (${doc.bana} ${doc.datum}, ${doc.lopp.length} lopp)`);
  return true;
}

async function main() {
  const ids = dagar();
  if (!ids.length) {
    log(`Användning:
  node scripts/fetch-sportinfo-lopp.mjs --omgang <omgång[,omgång …]> [--antal 5]
  node scripts/fetch-sportinfo-lopp.mjs <tävlingsdagens ts-id> [fler]
Flaggor: --igen (hämta om), --dold (inget fönster)`);
    return;
  }
  log(`${ids.length} tävlingsdagar att gå igenom`);
  const { chromium } = await import("playwright");
  const browser = await launch(chromium, arg("dold"));
  const page = await browser.newPage({ locale: "sv-SE", viewport: { width: 1360, height: 900 } });
  try {
    let besokt = false;
    for (const id of ids) {
      const ny = !fs.existsSync(path.join(DIR, `${id}.json`)) || arg("igen");
      if (ny && besokt) await paus(20000, 45000, "Väntar innan nästa tävlingsdag");
      if (await hamtaDag(page, id, { igen: !!arg("igen") })) besokt = true;
    }
  } finally {
    await browser.close();
  }
}

const self = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (self) {
  main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
}
