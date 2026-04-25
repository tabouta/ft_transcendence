import { and, desc, eq, getTableColumns, ne, or } from "drizzle-orm";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { getViewColumns } from "$lib/typeUtils";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const currentUser = requireLogin();
  const chats = await Promise.all(
    (
      await db
        .select()
        .from(schema.usersPair)
        .where(
          or(
            eq(schema.usersPair.left, currentUser.id),
            eq(schema.usersPair.right, currentUser.id),
          ),
        )
    ).map(async (chat) => ({
      ...chat,
      lastMessage: (
        await db
          .select({
            ...getTableColumns(schema.chatMessage),
            author: getViewColumns(schema.userPublic),
          })
          .from(schema.chatMessage)
          .where(eq(schema.chatMessage.friendsId, chat.id))
          .innerJoin(
            schema.userPublic,
            eq(schema.userPublic.id, schema.chatMessage.author),
          )
          .limit(1)
          .orderBy(desc(schema.chatMessage.sentAt))
      )
        ?.map(({ author, ...fields }) => ({
          author: author as schema.UserPublic,
          ...fields,
        }))
        ?.at(0),
      new:
        (
          await db
            .select()
            .from(schema.chatMessage)
            .where(
              and(
                eq(schema.chatMessage.friendsId, chat.id),
                eq(schema.chatMessage.read, false),
                ne(schema.chatMessage.author, currentUser.id),
              ),
            )
        ).at(0) !== undefined,
    })),
  );
  return {
    currentUser,
    chats: chats.sort(
      (a, b) =>
        (a.lastMessage?.sentAt &&
          b.lastMessage?.sentAt &&
          b.lastMessage.sentAt.getTime() - a.lastMessage.sentAt.getTime()) ??
        0,
    ),
  };
};
