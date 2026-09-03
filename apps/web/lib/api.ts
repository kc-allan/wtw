import { API_URL } from "./env";
import { readAccessToken } from "./session";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Field-level messages from the API's zod validation, when it sent any. */
    readonly fieldErrors: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequest extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Attaches the caller's access token; leave false for public endpoints. */
  auth?: boolean;
  /** Passed through to Next's fetch cache; defaults to no caching. */
  revalidate?: number | false;
  tags?: string[];
}

/**
 * The single door to the API. Everything server-side goes through here so that
 * token handling, error shapes and caching stay in one place rather than being
 * re-decided at each call site.
 */
export async function api<T>(path: string, options: ApiRequest = {}): Promise<T> {
  const { body, auth = true, revalidate = 0, tags, headers, ...init } = options;

  const token = auth ? await readAccessToken() : undefined;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    next: { revalidate, ...(tags ? { tags } : {}) },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, messageFrom(payload, response.status), errorsFrom(payload));
  }

  return payload as T;
}

/** True when the caller has a session at all — not that it is still valid. */
export async function isSignedIn(): Promise<boolean> {
  return (await readAccessToken()) !== undefined;
}

function messageFrom(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const { message } = payload as { message: unknown };
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  }
  return status === 401 ? "Please sign in again" : "Something went wrong";
}

function errorsFrom(payload: unknown): { path: string; message: string }[] {
  if (payload && typeof payload === "object" && "errors" in payload) {
    const { errors } = payload as { errors: unknown };
    if (Array.isArray(errors)) {
      return errors as { path: string; message: string }[];
    }
  }
  return [];
}
