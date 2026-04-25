import { error } from "@sveltejs/kit";
import { eq, inArray } from "drizzle-orm";
import z from "zod";
import { query } from "$app/server";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { requireLogin } from "./server/auth";

export const getUser = query.batch(z.string(), async (users) => {
  if (users === undefined) {
    console.error("USERS UNDEFINED");
  }
  const result = await db
    .select()
    .from(schema.userPublic)
    .where(inArray(schema.userPublic.id, users));
  const lookup = new Map(
    result
      .map((user) => user as schema.UserPublic)
      .map((user) => [user.id, user]),
  );
  return (user) => lookup.get(user);
});

export const getApiKey = query(z.string(), async (userId) => {
  const currentUser = requireLogin();
  if (currentUser.id !== userId) error(403);
  const [{ apiKey }] = await db
    .select({ apiKey: schema.user.apiKey })
    .from(schema.user)
    .where(eq(schema.user.id, userId));
  if (apiKey) return apiKey;
  return undefined;
});
