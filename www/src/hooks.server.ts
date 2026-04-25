import { error, type Handle, type RequestEvent } from "@sveltejs/kit";
import { RateLimiter } from "sveltekit-rate-limiter/server";
import * as auth from "$lib/server/auth";

const handleAuth = async (event: RequestEvent) => {
  const sessionToken = event.cookies.get(auth.sessionCookieName);

  if (!sessionToken) {
    event.locals.user = undefined;
    event.locals.session = undefined;
    return;
  }

  const { session, user } = await auth.validateSessionToken(sessionToken);

  if (session) {
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } else {
    auth.deleteSessionTokenCookie(event);
  }

  event.locals.user = user;
  event.locals.session = session;
};

const limiter = new RateLimiter({
  IP: [10, "h"], // IP address
  IPUA: [5, "m"], // IP address + User Agent
});

const rateLimitApi = async (event: RequestEvent) => {
  if (await limiter.isLimited(event)) throw error(429);
};

const handleApiAuth = async (event: RequestEvent) => {
  const apiKey = event.request.headers.get(auth.apiKeyHeader);
  if (!apiKey) {
    error(401);
  }
  event.locals.apiUser = await auth.validateApiKey(apiKey);
};

export const handle: Handle = async ({ event, resolve }) => {
  if (event.route.id?.startsWith("/api/")) {
    await rateLimitApi(event);
    await handleApiAuth(event);
  } else {
    await handleAuth(event);
  }
  return resolve(event);
};
