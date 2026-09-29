import "server-only";
import { z } from "zod";

/**
 * An expected failure with a status and a public-safe message. Anything else thrown in a
 * route is treated as a bug: logged in full on the server, answered with a generic 500.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message = "The request is invalid.", code = "bad_request") => new ApiError(400, code, message);
export const unauthorized = () => new ApiError(401, "unauthorized", "You need to sign in.");
export const forbidden = () => new ApiError(403, "forbidden", "This request is not allowed.");
export const notFound = (message = "Not found.") => new ApiError(404, "not_found", message);

export type ErrorBody = {
  error: { code: string; message: string; fields?: { path: string; message: string }[] };
};

function json(body: ErrorBody, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

type Handler<C> = (request: Request, context: C) => Promise<Response>;

/**
 * Wraps a route handler with the project's error policy:
 * - ApiError -> its status and message
 * - ZodError -> 400 with the failing field paths (no internals, just which input was wrong)
 * - anything else -> logged server-side, generic 500 (never a stack trace, query or path)
 */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return json({ error: { code: error.code, message: error.message } }, error.status, error.headers);
      }
      if (error instanceof z.ZodError) {
        const fields = error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
        return json({ error: { code: "validation_error", message: "Some fields are invalid.", fields } }, 400);
      }
      const { pathname } = new URL(request.url);
      console.error(`[api] ${request.method} ${pathname} failed:`, error);
      return json({ error: { code: "internal_error", message: "Something went wrong. Please try again later." } }, 500);
    }
  };
}
