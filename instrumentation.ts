/**
 * Runs once when a server instance starts. In production a missing or invalid setting
 * (see .env.example) stops the server from starting, instead of failing on the first
 * visitor who happens to hit that feature. In development it only warns, so the public
 * pages can be worked on before every service is set up.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // `next build` also loads this; the build machine doesn't need runtime secrets.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { assertServerEnv } = await import("./lib/server/env");
  try {
    assertServerEnv();
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn(`[config] ${error instanceof Error ? error.message : error}\n(Development: the related API routes will fail until this is set in .env.local.)`);
  }
}
