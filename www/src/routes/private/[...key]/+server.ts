import { error } from "@sveltejs/kit";
import { eq, getTableColumns } from "drizzle-orm";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { PrivateStorage } from "$lib/server/storage";
import { MESSAGE_FILE_PREFIX } from "$lib/storage";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params: { key } }) => {
  if (key.startsWith(MESSAGE_FILE_PREFIX)) {
    return getMessageFile(key);
  }
  return error(404);
};

async function getMessageFile(key: string) {
  const user = requireLogin();
  const id = key.replace(MESSAGE_FILE_PREFIX, "");
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
  const file = PrivateStorage.get(key);
  if (!(await file.exists())) {
    error(404);
  }
  return new Response(file.stream());
}
