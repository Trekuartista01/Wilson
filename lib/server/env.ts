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

export function authEnv() {
  const jwtSecret = required("JWT_SECRET");
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  const passwordHash = required("ADMIN_PASSWORD_HASH");
  if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(passwordHash)) {
    throw new Error("ADMIN_PASSWORD_HASH is not a bcrypt hash (generate one with `npm run hash-password`)");
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

/** Throws with every missing or invalid setting at once. */
export function assertServerEnv(): void {
  const problems: string[] = [];
  for (const check of [supabaseEnv, supabasePublicEnv, authEnv, mailEnv]) {
    try {
      check();
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (problems.length) {
    throw new Error(`Invalid server configuration:\n - ${problems.join("\n - ")}`);
  }
}
