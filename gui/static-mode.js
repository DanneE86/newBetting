// Webbversion (Cloudflare Pages): laddas före app.js och styr om /api/* till förbyggda
// JSON-filer i /api/ (scripts/build-static-site.mjs). Knappar som kräver servern döljs.
(() => {
  const realFetch = window.fetch.bind(window);
  const json = (status, body) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const readOnly = () =>
    json(403, { error: "Webbversionen är skrivskyddad – data hämtas automatiskt varje morgon via GitHub Actions." });

  let analyses = null;
  const loadAnalyses = async () => {
    if (!analyses) analyses = realFetch("/api/analyze.json").then((r) => (r.ok ? r.json() : {}));
    return analyses;
  };

  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/api/") || url.pathname.endsWith(".json")) {
      return realFetch(input, init);
    }
    if ((init.method || "GET").toUpperCase() !== "GET") return readOnly();

    if (url.pathname === "/api/analyze") {
      const p = url.searchParams;
      const key = [p.get("league"), p.get("date"), p.get("home"), p.get("away")].join("|");
      const hit = (await loadAnalyses())[key];
      return hit ? json(200, hit) : json(404, { error: "Ingen förberäknad analys för matchen" });
    }
    return realFetch(`${url.pathname}.json`, { cache: "no-store" });
  };

  // Ingen server som strömmar loggar: stäng direkt så att GUI:t inte väntar.
  window.EventSource = class {
    constructor() {
      setTimeout(() => this.onmessage?.({ data: JSON.stringify({ type: "done", replay: true, ok: true }) }), 0);
    }
    close() {}
  };

  const style = document.createElement("style");
  style.textContent = `#btn-fetch, #scan-run, .btn-lineup, #st-fetch { display: none !important; }`;
  document.head.appendChild(style);
})();
