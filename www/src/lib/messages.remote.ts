import { error } from "@sveltejs/kit";
import { and, eq, getTableColumns, ne } from "drizzle-orm";
import z from "zod";
import { command } from "$app/server";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";

export const setMessageRead = command(z.string(), async (id) => {
  const user = requireLogin();
  const [{ chatMessage, usersPair }] = await db
    .select({
      chatMessage: getTableColumns(schema.chatMessage),
      usersPair: getTableColumns(schema.usersPair),
    })
    .from(schema.chatMessage)
    .where(eq(schema.chatMessage.id, id))
    .innerJoin(
      schema.usersPair,
      eq(schema.chatMessage.friendsId, schema.usersPair.id),
    );
  if (!chatMessage || !usersPair) {
    error(404);
  }
  if (user.id !== usersPair.left && user.id !== usersPair.right) {
    error(403);
  }
  try {
    await db
      .update(schema.chatMessage)
      .set({ read: true })
      .where(
        and(
          eq(schema.chatMessage.id, id),
          ne(schema.chatMessage.author, user.id),
        ),
      );
  } catch {
    error(404);
  }
});
