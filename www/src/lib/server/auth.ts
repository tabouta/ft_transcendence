import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import type { RequestEvent } from "@sveltejs/kit";
import { error, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema";
import { getUser } from "$lib/user.remote";

export function getCurrentUser() {
  return getRequestEvent().locals.user ?? undefined;
}

export function requireLogin() {
  const user = getCurrentUser();

  if (!user) {
    redirect(302, "/login");
  }

  return user;
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const EXPIRATION_TIME = DAY_IN_MS * 30;
const RENEW_TIME = DAY_IN_MS * 15;

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = encodeBase64url(bytes);
  return token;
}

export async function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: table.Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + EXPIRATION_TIME),
  };
  await db.insert(table.session).values(session);
  return session;
}

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [result] = await db
    .select()
    .from(table.session)
    .innerJoin(table.user, eq(table.session.userId, table.user.id))
    .where(eq(table.session.id, sessionId));

  if (!result) {
    return { session: undefined, user: undefined };
  }
  const { session, user } = result;

  const sessionExpired = Date.now() >= session.expiresAt.getTime();
  if (sessionExpired) {
    await db.delete(table.session).where(eq(table.session.id, session.id));
    return { session: undefined, user: undefined };
  }

  const renewSession = Date.now() >= session.expiresAt.getTime() - RENEW_TIME;
  if (renewSession) {
    session.expiresAt = new Date(Date.now() + EXPIRATION_TIME);
    await db
      .update(table.session)
      .set({ expiresAt: session.expiresAt })
      .where(eq(table.session.id, session.id));
  }

  return { session, user: await getUser(user.id) };
}

export type SessionValidationResult = Awaited<
  ReturnType<typeof validateSessionToken>
>;

export async function invalidateSession(sessionId: string) {
  await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(
  event: RequestEvent,
  token: string,
  expiresAt: Date,
) {
  event.cookies.set(sessionCookieName, token, {
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(sessionCookieName, {
    path: "/",
  });
}

export const apiKeyHeader = "Api-Key";

export async function validateApiKey(apiKey: string) {
  const [user] = await db
    .select()
    .from(table.user)
    .where(eq(table.user.apiKey, apiKey));
  if (!user) {
    error(401);
  }
  return user;
}

export function getApiUser() {
  const event = getRequestEvent();
  if (!event.route?.id?.startsWith("/api")) {
    error(500);
  }
  return event.locals.apiUser;
}

export type ApiValidationResult = Awaited<ReturnType<typeof validateApiKey>>;
