import { error } from "@sveltejs/kit";
import z from "zod";
import { getPosts } from "$lib/posts.remote";
import { getApiUser } from "$lib/server/auth";
import { createPost } from "$lib/server/posts";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const author = url.searchParams.get("author") ?? undefined;
  const pet = url.searchParams.get("pet") ?? undefined;
  // TODO sortBy
  const posts = (await getPosts({ author, pet })).map((post) => ({
    ...post,
    author: post.author,
  }));
  return new Response(JSON.stringify(posts));
};

export const POST: RequestHandler = async ({ request }) => {
  const user = getApiUser();
  const requestSchema = z
    .object({
      content: z.string(),
      pet: z.string().optional(),
      file: z.file().optional(),
    })
    .strict();
  const formData = Object.fromEntries((await request.formData()).entries());
  const parsed = requestSchema.safeParse(formData);
  if (!parsed.success) {
    error(400, parsed.error);
  }
  const post = await createPost({ ...parsed.data, author: user.id });
  return new Response(JSON.stringify(post));
};
