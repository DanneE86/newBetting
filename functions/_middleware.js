// Cloudflare Pages: lösenordsskydd för hela webbversionen.
// Lösenordet ligger som secret SITE_PASSWORD i Pages-projektet.
// Inloggning sker via /login (formulär) och sparas i en signerad cookie i 90 dagar.
// Byts lösenordet blir alla gamla inloggningar ogiltiga. /logout loggar ut.
const COOKIE = "nb_session";
const MAX_AGE = 60 * 60 * 24 * 90;

export async function onRequest({ request, env, next }) {
  const expected = env.SITE_PASSWORD;
  if (!expected) return new Response("SITE_PASSWORD är inte satt i Pages-projektet.", { status: 503 });

  const url = new URL(request.url);
  const token = await sessionToken(expected);

  if (url.pathname === "/logout") {
    return redirect("/login", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  }

  if (url.pathname === "/login") {
    const target = safeNext(url.searchParams.get("next"));
    if (request.method === "POST") {
      const form = await request.formData();
      if (String(form.get("password") || "") === expected) {
        return redirect(target, `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
      }
      return loginPage(target, true);
    }
    if (readCookie(request, COOKIE) === token) return redirect(target);
    return loginPage(target, false);
  }

  if (readCookie(request, COOKIE) === token || basicAuthOk(request, expected)) return next();

  // API-anrop (fetch från sidan) får 401 i stället för en omdirigering till HTML.
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Inloggning krävs" }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  return redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
}

async function sessionToken(secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("newbetting-session-v1"));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

// Behålls så att äldre bokmärken/skript med Basic Auth fortsätter fungera.
function basicAuthOk(request, expected) {
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  try {
    const decoded = atob(auth.slice(6));
    return decoded.slice(decoded.indexOf(":") + 1) === expected;
  } catch {
    return false;
  }
}

function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/login") ? value : "/tips";
}

function redirect(location, cookie) {
  const headers = { Location: location, "Cache-Control": "no-store" };
  if (cookie) headers["Set-Cookie"] = cookie;
  return new Response(null, { status: 303, headers });
}


function loginPage(target, failed) {
  const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Logga in – Betting</title>
<style>
  :root { color-scheme: light dark; --bg:#f4f5f7; --card:#fff; --text:#1b1d21; --muted:#6b7280; --accent:#1f7a4d; --err:#b42318; --line:#d6d9de; }
  @media (prefers-color-scheme: dark) { :root { --bg:#111317; --card:#1b1e24; --text:#e8eaed; --muted:#9aa0a6; --accent:#3fb97a; --err:#f97066; --line:#343841; } }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; padding:16px; background:var(--bg); color:var(--text); font:16px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; }
  form { width:100%; max-width:340px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:24px; }
  h1 { margin:0 0 4px; font-size:1.3rem; }
  p { margin:0 0 20px; color:var(--muted); font-size:.9rem; }
  label { display:block; font-size:.85rem; margin-bottom:6px; }
  input { width:100%; padding:12px; font-size:16px; border:1px solid var(--line); border-radius:8px; background:transparent; color:inherit; }
  button { width:100%; margin-top:16px; padding:12px; font-size:16px; font-weight:600; border:0; border-radius:8px; background:var(--accent); color:#fff; cursor:pointer; }
  .err { color:var(--err); margin:12px 0 0; font-size:.9rem; }
</style>
</head>
<body>
<form method="post" action="/login?next=${encodeURIComponent(target)}">
  <h1>Betting</h1>
  <p>Logga in för att se tipsen.</p>
  <input type="text" name="username" value="betting" autocomplete="username" hidden>
  <label for="pw">Lösenord</label>
  <input id="pw" type="password" name="password" autocomplete="current-password" autofocus required>
  <button type="submit">Logga in</button>
  ${failed ? '<p class="err">Fel lösenord, försök igen.</p>' : ""}
</form>
</body>
</html>`;
  return new Response(html, {
    status: failed ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
