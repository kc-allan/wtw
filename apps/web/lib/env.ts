/**
 * The API base URL is read on the server only. Keeping it off the client is
 * the point of the proxy: the browser talks to this app, this app talks to the
 * API, and the tokens never leave the server.
 */
export const API_URL = process.env.API_URL ?? "http://localhost:4100/api/v1";

/** Where guests open a published event, used when building share links. */
export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
