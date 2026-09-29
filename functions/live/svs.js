// Cloudflare Pages: live-streck från Svenska Spel för Stryktipset/Europatipset (/live/svs?product=europatipset).
// Svenska Spels API tillåter inte anrop från webbläsaren (CORS), så sidan hämtar via den här funktionen.
// Används av kupongsidan för att bygga kupongen på samma streck som Gambling Cabin räknar med just nu.
// Ligger utanför /api/ eftersom static-mode.js styr om /api/* till förbyggda JSON-filer. Kräver inloggning (_middleware.js).
const PRODUCTS = new Set(["stryktipset", "europatipset"]);
const num = (s) => {
  const n = Number(String(s ?? "").replace(",", "."));
  return s == null || s === "" || !Number.isFinite(n) ? null : n;
};

export async function onRequestGet({ request }) {
  const product = new URL(request.url).searchParams.get("product");
  if (!PRODUCTS.has(product)) return json(400, { error: "Okänt spel" });
  const res = await fetch(`https://api.spela.svenskaspel.se/draw/1/${product}/draws`, { cf: { cacheTtl: 0 } });
  if (!res.ok) return json(502, { error: `Svenska Spel svarade ${res.status}` });
  const body = await res.json();
  const draw = (body.draws || [body.draw]).find(Boolean);
  if (!draw) return json(404, { error: "Ingen öppen kupong" });
  return json(200, {
    product,
    drawNumber: draw.drawNumber,
    drawState: draw.drawState,
    regCloseTime: draw.regCloseTime,
    turnover: num(draw.currentNetSale),
    fetchedAt: new Date().toISOString(),
    events: (draw.drawEvents || []).map((e) => {
      const f = e.svenskaFolket;
      return { eventNumber: e.eventNumber, folk: f ? [num(f.one), num(f.x), num(f.two)] : null, folkDate: f?.date || null };
    }),
  });
}

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
