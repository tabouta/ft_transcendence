import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { PUBLIC_MAX_FILE_SIZE } from "$env/static/public";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { PublicStorage } from "$lib/server/storage";
import { USER_AVATAR_PREFIX } from "$lib/storage";

export async function updatePerson(
  id: string,
  {
    avatar,
    removeAvatar = false,
    ...values
  }: {
    firstName?: string;
    lastName?: string;
    description?: string;
    city?: string;
    avatar?: File;
    removeAvatar?: boolean;
  },
) {
  if (avatar) {
    if (avatar.size > Number(PUBLIC_MAX_FILE_SIZE)) {
      error(413);
    }
    if (!avatar.type.startsWith("image/")) {
      error(415);
    }
    await PublicStorage.upload(USER_AVATAR_PREFIX + id, avatar, avatar.type);
    return (
      await db
        .update(schema.person)
        .set({ ...values, hasAvatar: true })
        .where(eq(schema.person.id, id))
        .returning()
    ).at(0);
  } else if (removeAvatar) {
    await PublicStorage.delete(USER_AVATAR_PREFIX + id);
    return (
      await db
        .update(schema.person)
        .set({ ...values, hasAvatar: false })
        .where(eq(schema.person.id, id))
        .returning()
    ).at(0);
  } else {
    return (
      await db
        .update(schema.person)
        .set(values)
        .where(eq(schema.person.id, id))
        .returning()
    ).at(0);
  }
}
