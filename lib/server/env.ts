import "server-only";

/**
 * Server-side configuration. Every value comes from the environment (.env.local locally,
 * Vercel project settings in production) and none has a fallback: a missing value throws.
 * Grouped by feature and read lazily, so e.g. the public pages still render while email is
 * not configured yet. instrumentation.ts checks all groups at startup in production.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function supabaseEnv() {
  return {
    url: required("SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

/**
 * Public (publishable) key, used for what visitors see. Row level security then guarantees
 * only published listings are readable, whatever the code asks for.
 */
export function supabasePublicEnv() {
  return {
    url: required("SUPABASE_URL"),
    publishableKey: required("SUPABASE_PUBLISHABLE_KEY"),
  };
}

/**
 * What's wrong with a bad hash, without revealing it: length and the usual paste mistakes.
 * A bcrypt hash is 60 characters like $2b$12$..., with no backslashes, quotes or spaces.
 */
function describeHash(value: string): string {
  const issues = [
    `${value.length} characters (expected 60)`,
    value.includes("\\") ? "contains a backslash" : "",
    /["']/.test(value) ? "contains a quote" : "",
    /\s/.test(value) ? "contains a space or line break" : "",
    /^\$2[aby]\$/.test(value) ? "" : "does not start with $2a$/$2b$/$2y$",
  ].filter(Boolean);
  return `Stored value: ${issues.join(", ")}.`;
}

export function authEnv() {
  const jwtSecret = required("JWT_SECRET");
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  const passwordHash = required("ADMIN_PASSWORD_HASH");
  if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(passwordHash)) {
    throw new Error(
      `ADMIN_PASSWORD_HASH is not a bcrypt hash (generate one with \`npm run hash-password\`). ${describeHash(passwordHash)}`,
    );
  }
  return {
    username: required("ADMIN_USERNAME"),
    passwordHash,
    jwtSecret,
  };
}

export function mailEnv() {
  const port = Number(required("SMTP_PORT"));
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number");
  }
  return {
    host: required("SMTP_HOST"),
    port,
    // Port 465 is implicit TLS; others (587, 25) upgrade with STARTTLS.
    secure: port === 465,
    user: required("SMTP_USER"),
    pass: required("SMTP_PASS"),
    from: required("SMTP_FROM"),
    /** Where contact form messages are delivered. */
    to: required("CONTACT_TO"),
  };
}

function problemsIn(checks: (() => unknown)[]): string[] {
  const problems: string[] = [];
  for (const check of checks) {
    try {
      check();
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
    }
  }
  return problems;
}

/**
 * Every missing or invalid setting, split by impact. `blocking`: the public site can't work
 * (listings come from Supabase). `degraded`: only the admin login or the contact form fails,
 * and those fail closed on their own (authEnv / mailEnv throw when used), so the showcase
 * site can run without them (2026-10-07, team preview on Vercel).
 */
export function checkServerEnv(): { blocking: string[]; degraded: string[] } {
  return {
    blocking: problemsIn([supabaseEnv, supabasePublicEnv]),
    degraded: problemsIn([authEnv, mailEnv]),
  };
}
