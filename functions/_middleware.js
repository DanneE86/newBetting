// Cloudflare Pages: lösenordsskydd (HTTP Basic Auth) för hela webbversionen.
// Lösenordet ligger som secret SITE_PASSWORD i Pages-projektet; användarnamnet spelar ingen roll.
export async function onRequest({ request, env, next }) {
  const expected = env.SITE_PASSWORD;
  if (!expected) return new Response("SITE_PASSWORD är inte satt i Pages-projektet.", { status: 503 });

  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if (password === expected) return next();
    } catch {
      /* ogiltig header */
    }
  }
  return new Response("Inloggning krävs", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Betting", charset="UTF-8"' },
  });
}
