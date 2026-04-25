import { error, redirect } from "@sveltejs/kit";
import { and, eq, gt } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { PrivateStorage, PublicStorage } from "$lib/server/storage";
import {
  MESSAGE_FILE_PREFIX,
  PET_AVATAR_PREFIX,
  POST_IMAGE_PREFIX,
  USER_AVATAR_PREFIX,
} from "$lib/storage";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const [user] = await db
    .select()
    .from(schema.user)
    .where(
      and(
        eq(schema.user.gdprToken, params.token),
        gt(schema.user.gdprTokenExpiresAt, new Date()),
      ),
    );

  if (!user) {
    error(400, { message: "Invalid or expired confirmation link" });
  }

  const action = user.gdprTokenAction;

  await db
    .update(schema.user)
    .set({ gdprToken: null, gdprTokenExpiresAt: null, gdprTokenAction: null })
    .where(eq(schema.user.id, user.id));

  switch (action) {
    case "export": {
      const {
        passwordHash,
        gdprToken,
        gdprTokenExpiresAt,
        gdprTokenAction,
        ...safeUser
      } = user;
      const data = {
        ...safeUser,
        person: (
          await db
            .select()
            .from(schema.person)
            .where(eq(schema.person.id, user.id))
        ).at(0),
        association: (
          await db
            .select()
            .from(schema.association)
            .where(eq(schema.association.id, user.id))
        ).at(0),
        pets: await db
          .select()
          .from(schema.pet)
          .where(eq(schema.pet.ownerId, user.id)),
        posts: await db
          .select()
          .from(schema.post)
          .where(eq(schema.post.author, user.id)),
        comments: await db
          .select()
          .from(schema.postComment)
          .where(eq(schema.postComment.author, user.id)),
        messages: await db
          .select()
          .from(schema.chatMessage)
          .where(eq(schema.chatMessage.author, user.id)),
      };

      const publicFileKeys = [
        ...(data.person?.hasAvatar ? [USER_AVATAR_PREFIX + user.id] : []),
        ...data.pets
          .filter((p) => p.hasAvatar)
          .map((p) => PET_AVATAR_PREFIX + p.id),
        ...data.posts.map((p) => POST_IMAGE_PREFIX + p.id),
      ];
      const privateFileKeys = data.messages
        .filter((m) => m.isFile)
        .map((m) => MESSAGE_FILE_PREFIX + m.id);

      const files = await Promise.all(
        [
          ...publicFileKeys.map((key) => ({
            key,
            stat: PublicStorage.stat(key),
            file: PublicStorage.get(key).arrayBuffer(),
          })),
          ...privateFileKeys.map((key) => ({
            key,
            stat: PrivateStorage.stat(key),
            file: PrivateStorage.get(key).arrayBuffer(),
          })),
        ].map(async ({ key, stat, file }) => {
          const ext = (await stat).type.split("/")[1];
          return [key + (ext ? "." : "") + ext, await file] satisfies readonly [
            string,
            ArrayBuffer,
          ];
        }),
      );

      const name = data.person
        ? `${data.person.firstName.toLowerCase()}_${data.person.lastName.toLowerCase()}`
        : (data.association?.name ?? "");

      return new Response(
        await new Bun.Archive(
          {
            "data.json": JSON.stringify(data, undefined, " "),
            ...Object.fromEntries(new Map(files).entries()),
          },
          { compress: "gzip" },
        ).blob(),
        {
          headers: {
            "Content-Disposition": `attachment; filename="bibis_farm_data_${name}.tar.gz"`,
            "Content-Type": "application/gzip",
          },
        },
      );
    }

    case "delete": {
      const posts = await db
        .select()
        .from(schema.post)
        .where(eq(schema.post.author, user.id));
      for (const post of posts) {
        await PublicStorage.delete(POST_IMAGE_PREFIX + post.id);
      }

      const pets = await db
        .select()
        .from(schema.pet)
        .where(eq(schema.pet.ownerId, user.id));
      for (const pet of pets) {
        await PublicStorage.delete(PET_AVATAR_PREFIX + pet.id);
      }

      await PublicStorage.delete(USER_AVATAR_PREFIX + user.id);
      await db.delete(schema.user).where(eq(schema.user.id, user.id));

      return redirect(302, "/");
    }
  }

  error(400, { message: "Unknown action" });
};
