import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { getApiUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params: { commentId: id } }) => {
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  const comment = await db
    .select()
    .from(schema.postComment)
    .where(eq(schema.postComment.id, id));
  if (!comment) {
    error(404);
  }
  return new Response(JSON.stringify(comment));
};

export const PUT: RequestHandler = async ({
  params: { commentId: id },
  request,
}) => {
  const user = getApiUser();
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  const formData = Object.fromEntries((await request.formData()).entries());
  const parsed = z
    .object({
      content: z.string(),
    })
    .strict()
    .safeParse(formData);
  if (parsed.success) {
    const updated = (
      await db
        .update(schema.postComment)
        .set(parsed.data)
        .where(
          and(
            eq(schema.postComment.id, id),
            eq(schema.postComment.author, user.id),
          ),
        )
        .returning()
    ).at(0);
    if (!updated) {
      error(404);
    }
    return new Response(JSON.stringify(updated));
  } else {
    error(400, parsed.error);
  }
};

export const DELETE: RequestHandler = async ({ params: { commentId: id } }) => {
  const user = getApiUser();
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  const deleted = (
    await db
      .delete(schema.postComment)
      .where(
        and(
          eq(schema.postComment.id, id),
          eq(schema.postComment.author, user.id),
        ),
      )
      .returning()
  ).at(0);
  if (!deleted) {
    error(404);
  }
  return new Response();
};
