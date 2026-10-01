// Webbversion (Cloudflare Pages): laddas före app.js och styr om /api/* till förbyggda
// JSON-filer i /api/ (scripts/build-static-site.mjs). Knappar som kräver servern döljs.
(() => {
  const realFetch = window.fetch.bind(window);
  const json = (status, body) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const readOnly = () =>
    json(403, { error: "Webbversionen är skrivskyddad – data uppdateras när du trycker Hämta i den lokala appen." });

  let analyses = null;
  const loadAnalyses = async () => {
    if (!analyses) analyses = realFetch("/api/analyze.json").then((r) => (r.ok ? r.json() : {}));
    return analyses;
  };
  const matchups = {};
  const loadMatchups = async (league) => {
    if (!matchups[league]) matchups[league] = realFetch(`/api/matchup/${encodeURIComponent(league)}.json`).then((r) => (r.ok ? r.json() : {}));
    return matchups[league];
  };
  let teams = null;
  const loadTeams = async () => {
    if (!teams) teams = realFetch("/api/team.json").then((r) => (r.ok ? r.json() : {}));
    return teams;
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
    if (url.pathname === "/api/matchup") {
      const p = url.searchParams;
      const key = [p.get("league"), p.get("date"), p.get("home"), p.get("away")].join("|");
      const hit = (await loadMatchups(p.get("league")))[key];
      return hit ? json(200, hit) : json(404, { error: "Ingen förberäknad duellanalys för matchen" });
    }
    if (url.pathname === "/api/team") {
      const p = url.searchParams;
      const hit = (await loadTeams())[[p.get("league"), p.get("team"), p.get("opp"), p.get("venue")].join("|")];
      return hit ? json(200, hit) : json(404, { error: "Ingen förberäknad lagdata för matchen" });
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
  style.textContent = `#btn-fetch, #scan-run, .btn-lineup, #st-fetch, #foot-local { display: none !important; }`;
  document.head.appendChild(style);
})();
