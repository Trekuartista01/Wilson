/**
 * Runs once when a server instance starts and checks the settings (see .env.example). In
 * production a missing Supabase setting stops the server, since no page works without it.
 * Admin login and email problems are logged loudly but don't take the whole site down:
 * those features refuse to work on their own until fixed. In development everything only warns.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // `next build` also loads this; the build machine doesn't need runtime secrets.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { checkServerEnv } = await import("./lib/server/env");
  const { blocking, degraded } = checkServerEnv();
  const list = (problems: string[]) => ` - ${problems.join("\n - ")}`;
  if (degraded.length) {
    // Admin login / contact form refuse to work until fixed; the rest of the site runs.
    console.error(`[config] Some features are disabled:\n${list(degraded)}`);
  }
  if (blocking.length) {
    const message = `Invalid server configuration:\n${list(blocking)}`;
    if (process.env.NODE_ENV === "production") throw new Error(message);
    console.warn(`[config] ${message}\n(Development: listings won't load until this is set in .env.local.)`);
  }
}
