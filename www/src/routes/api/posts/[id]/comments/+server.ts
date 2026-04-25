import { error } from "@sveltejs/kit";
import z from "zod";
import { getPostComments } from "$lib/posts.remote";
import { getApiUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params: { id: postId } }) => {
  const comments = await getPostComments(postId);
  return new Response(JSON.stringify(comments));
};

export const POST: RequestHandler = async ({
  params: { id: postId },
  request,
}) => {
  const user = getApiUser();
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
        .insert(schema.postComment)
        .values({
          id: crypto.randomUUID(),
          post: postId,
          author: user.id,
          postedAt: new Date(),
          ...parsed.data,
        })
        .returning()
    ).at(0);
    return new Response(JSON.stringify(updated));
  } else {
    error(400, parsed.error);
  }
};
