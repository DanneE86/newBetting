// Sportinfo-resultat för en eller flera hästar (sportapp.travsport.se).
//
// Så lästes Zätamustangen (ts772022):
// Ett vanligt HTTP-anrop får 403 och sidan "Verifying...". En webbläsare som laddar
// om en gång kommer in på resultatfliken. Resultaten ligger i ett rutnät
// (role=row / role=gridcell), inte i en <table>. Skor och vagn är ikoner med title
// ("Barfota bak", "Amerikansk sulky") och syns inte som text. Tomma celler på strukna
// starter hoppas över i DOM:en, så kolumnen tas från aria-colindex. Tid "12,0a" är
// km-tid 1.12,0 med autostart, och "g" betyder galopp. Datum är ÅÅMMDD-lopp.
// Bankoden slås mot en fast lista i scripts/lib/travsport-hast.mjs.
//
// Skriptet gör samma sak, en häst i taget, och väntar mellan stegen som en person
// som läser sidan. Det letar inte upp hästar själv. Syns robotkontrollen väntar det
// och laddar om en gång. Ligger kontrollen kvar avbryts körningen, utan fler försök.
//
//   node scripts/fetch-travsport-hast.mjs ts772022
//   node scripts/fetch-travsport-hast.mjs --fil data/hastar/travsport/ids.txt
//   node scripts/fetch-travsport-hast.mjs --dold ts772022
//
// Sparar data/hastar/travsport/<id>.json (gitignorerad). Hoppar över redan sparade
// om inte --igen anges. Utan id skrivs bara användningen, och inget hämtas.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sleep } from "./lib/http.mjs";
import { extractSportinfo, horseIdFrom, isRobotText, normalizeHorse, scrollStarts } from "./lib/travsport-hast.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "data", "hastar", "travsport");
const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(`--${k}`);
  return i < 0 ? null : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};
const log = (...a) => console.log(...a);
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });

const mellan = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
async function paus(min, max, varfor) {
  const ms = mellan(min, max);
  log(`${varfor} (${(ms / 1000).toFixed(1)} s)`);
  await sleep(ms);
}

function idsFromArgs() {
  const ids = [];
  const push = (s) => {
    const id = horseIdFrom(s);
    if (id && !ids.includes(id)) ids.push(id);
  };
  const fil = arg("fil");
  if (fil === true) throw new Error("Ange en fil efter --fil");
  if (typeof fil === "string") {
    if (!fs.existsSync(fil)) throw new Error(`Hittar inte ${fil}`);
    for (const line of fs.readFileSync(fil, "utf8").split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#")) push(t);
    }
  }
  let hoppa = false;
  for (const a of args) {
    if (hoppa) {
      hoppa = false;
      continue;
    }
    if (a === "--fil") {
      hoppa = true;
      continue;
    }
    if (a.startsWith("--")) continue;
    push(a);
  }
  return ids;
}

function usage() {
  log(`Användning:
  node scripts/fetch-travsport-hast.mjs <ts-id eller url> [fler id]
  node scripts/fetch-travsport-hast.mjs --fil <en id eller url per rad>
Flaggor: --igen (hämta om), --dold (inget fönster)
Utan id hämtas ingenting.`);
}

async function launch(chromium, dold) {
  const opts = { headless: !!dold };
  try {
    return await chromium.launch({ ...opts, channel: "chrome" });
  } catch {
    return await chromium.launch(opts);
  }
}

async function sidtext(page) {
  return page.evaluate(() => ({ title: document.title || "", body: (document.body?.innerText || "").slice(0, 500) }));
}

async function oppna(page, id) {
  const url = `https://sportapp.travsport.se/sportinfo/horse/${id}/results`;
  log(`Öppnar ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await paus(2500, 5000, "Sidan får rita klart");
  await page.waitForFunction(
    () => !!document.querySelector("h1") || /verifying|not a robot|inte en robot/i.test(`${document.title}\n${document.body?.innerText || ""}`),
    { timeout: 45000 },
  );
  let vis = await sidtext(page);
  if (isRobotText(vis.title, vis.body)) {
    log("Sportinfo visar en kontroll. Väntar och laddar om en gång.");
    await paus(8000, 16000, "Väntar vid kontrollen");
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    await paus(2500, 5000, "Sidan får rita klart");
    vis = await sidtext(page);
  }
  if (isRobotText(vis.title, vis.body)) {
    throw new Error("Sportinfo visar fortfarande robotkontroll. Öppna sidan själv i webbläsaren och kör skriptet senare. Körningen avbryts.");
  }
  await page.waitForSelector("h1", { timeout: 20000 });
  await paus(3000, 7000, "Läser sidan innan tabellen tas");
}

async function lasHast(page) {
  const seen = new Map();
  let profil = null;
  let stilla = 0;
  for (let steg = 0; steg < 80 && stilla < 3; steg++) {
    const raw = await page.evaluate(extractSportinfo);
    if (!profil && raw.namn) profil = raw;
    let nya = 0;
    for (const s of raw.starts) {
      const key = `${s.datum}|${s.bana}`;
      if (!s.datum || seen.has(key)) continue;
      seen.set(key, s);
      nya++;
    }
    const flytt = await page.evaluate(scrollStarts);
    if (!nya && !flytt) stilla++;
    else stilla = 0;
    if (stilla < 3) await paus(600, 1400, "Scrollar resultatlistan");
  }
  const base = profil || { namn: "", idLine: "", falt: {}, statRows: [], starts: [] };
  return { ...base, starts: [...seen.values()] };
}

async function hamtaEn(page, id, { igen }) {
  const fil = path.join(DIR, `${id}.json`);
  if (fs.existsSync(fil) && !igen) {
    log(`${id} finns redan, hoppar över (${path.relative(ROOT, fil)})`);
    return;
  }
  await oppna(page, id);
  const raw = await lasHast(page);
  if (!raw.namn) throw new Error(`${id}: sidan saknar hästnamn`);
  const out = normalizeHorse(raw, { id, hamtad: today() });
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(fil, JSON.stringify(out, null, 2) + "\n");
  log(`Sparade ${path.relative(ROOT, fil)} (${out.starter.length} starter, ${out.hast.namn})`);
}

async function main() {
  const filArg = arg("fil");
  const ids = idsFromArgs();
  if (typeof filArg === "string" && !ids.length) {
    console.error("Filen innehåller inga häst-id.");
    process.exit(1);
  }
  if (!ids.length) {
    usage();
    return;
  }
  const { chromium } = await import("playwright");
  const browser = await launch(chromium, arg("dold"));
  const page = await browser.newPage({
    locale: "sv-SE",
    viewport: { width: 1360, height: 900 },
  });
  try {
    for (let i = 0; i < ids.length; i++) {
      if (i > 0) await paus(20000, 45000, "Väntar innan nästa häst");
      await hamtaEn(page, ids[i], { igen: !!arg("igen") });
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
