// Browser-side calls to the admin API (app/api/admin). The session cookie goes along
// automatically; the browser adds the Origin header the API checks on writes.

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    /** Field paths the server rejected, e.g. "translations.en.title". */
    public readonly fields: string[] = [],
  ) {
    super(message);
  }
}

export async function adminApi<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const response = await fetch(`/api/admin${path}`, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });

  if (response.status === 401) {
    // Session expired or missing: back to the login page, explaining why. A full page load on
    // purpose: it drops any client state of the expired session. (Plain function, no router.)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login?expired=1");
    throw new AdminApiError(401, "unauthorized", "Session expired");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new AdminApiError(
      response.status,
      body?.error?.code ?? "error",
      body?.error?.message ?? response.statusText,
      (body?.error?.fields ?? []).map((f: { path: string }) => f.path),
    );
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
