import { error } from "@sveltejs/kit";
import { and, eq, or, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import * as z from "zod";
import { command, query } from "$app/server";
import { getCurrentUser, isLoggedIn, requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { getViewColumns } from "$lib/typeUtils";

export const getUserFriends = query(z.string(), async (userId: string) => {
  type Side = "left" | "right";
  const select = (self: Side, other: Side) => {
    return (
      db
        .select({
          ...getViewColumns(schema.userPublic),
          status: sql<"friends" | "sent" | "received" | null>`
          CASE
            WHEN ${schema.usersPair.friends} THEN
              CASE ${schema.usersPair.pending}
                WHEN ${schema.usersPair[self]} THEN 'received'
                WHEN ${schema.usersPair[other]} THEN 'sent'
                ELSE 'friends'
              END
            ELSE NULL
          END`,
        })
        // .select()
        .from(schema.usersPair)
        .where(
          and(
            eq(schema.usersPair.friends, true),
            eq(schema.usersPair[self], userId),
          ),
        )
        .innerJoin(
          schema.userPublic,
          eq(schema.usersPair[other], schema.userPublic.id),
        )
    );
  };
  return union(select("left", "right"), select("right", "left"));
});

export const getFriends = query(() => {
  if (!isLoggedIn()) return [];
  const user = requireLogin();
  return getUserFriends(user.id);
});

export const addFriend = command(z.string(), async (friendId) => {
  const user = getCurrentUser();
  if (!user) error(401);

  // Check if the friend is an association
  const friendUser = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, friendId))
    .limit(1);

  const isAssociation = friendUser[0]?.association !== null;

  try {
    await db
      .insert(schema.usersPair)
      .values({
        id: crypto.randomUUID(),
        left: user.id,
        right: friendId,
        friends: true,
        // If friend is an association, don't set pending (auto-accept)
        pending: isAssociation ? null : friendId,
      })
      .onConflictDoUpdate({
        target: [schema.usersPair.left, schema.usersPair.right],
        set: {
          friends: true,
          // If friend is an association, don't set pending (auto-accept)
          pending: isAssociation ? null : friendId,
        },
      });
  } catch {
    error(500);
  }
  await getFriends().refresh();
});

export const acceptFriend = command(z.string(), async (friendId) => {
  const user = getCurrentUser();
  if (!user) error(401);
  try {
    await db
      .update(schema.usersPair)
      .set({
        pending: null,
      })
      .where(
        and(
          eq(schema.usersPair.friends, true),
          eq(schema.usersPair.pending, user.id),
          and(
            or(
              eq(schema.usersPair.left, user.id),
              eq(schema.usersPair.right, user.id),
            ),
            or(
              eq(schema.usersPair.left, friendId),
              eq(schema.usersPair.right, friendId),
            ),
          ),
        ),
      );
  } catch {
    error(500);
  }
  await getFriends().refresh();
});

export const removeFriend = command(z.string(), async (friendId) => {
  const user = getCurrentUser();
  if (!user) error(401);
  await db
    .update(schema.usersPair)
    .set({
      friends: false,
      pending: null,
    })
    .where(
      and(
        eq(schema.usersPair.friends, true),
        and(
          or(
            eq(schema.usersPair.left, user.id),
            eq(schema.usersPair.right, user.id),
          ),
          or(
            eq(schema.usersPair.left, friendId),
            eq(schema.usersPair.right, friendId),
          ),
        ),
      ),
    );
  await getFriends().refresh();
});
