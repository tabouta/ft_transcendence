import { error } from "@sveltejs/kit";
import { and, asc, desc, eq, getTableColumns, inArray } from "drizzle-orm";
import z from "zod";
import { command, form, query } from "$app/server";
import { isLoggedIn, requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import * as posts from "$lib/server/posts";
import { PublicStorage } from "$lib/server/storage";
import { POST_IMAGE_PREFIX } from "$lib/storage";
import { TEXT_LIMITS } from "$lib/textLimits";
import { bunFileSchema } from "./zodUtils";

export const getPost = query.batch(z.string(), async (posts) => {
  const result = await db
    .select()
    .from(schema.post)
    .where(inArray(schema.post.id, posts));
  const lookup = new Map(result.map((post) => [post.id, post]));
  return (post) => lookup.get(post);
});

export const getPosts = query(
  z.object({
    author: z.string().optional(),
    pet: z.string().optional(),
    offset: z.int().optional(),
    limit: z.int().optional(),
  }),
  ({ author, pet, offset, limit }) => {
    const query = db
      .select(getTableColumns(schema.post))
      .from(schema.post)
      .where(
        and(
          author ? eq(schema.userPublic.id, author) : undefined,
          pet ? eq(schema.post.pet, pet) : undefined,
        ),
      )
      .innerJoin(
        schema.userPublic,
        eq(schema.post.author, schema.userPublic.id),
      )
      .orderBy(desc(schema.post.postedAt))
      .$dynamic();
    if (offset) query.offset(offset);
    if (limit) query.limit(limit);
    return query;
  },
);

export const likePost = command(z.string(), async (id) => {
  if (!isLoggedIn()) error(401);
  const user = requireLogin();
  await db.insert(schema.postLike).values({ post: id, user: user.id });
  await Promise.all([getPostLikes(id).refresh(), isPostLiked(id).refresh()]);
});

export const unlikePost = command(z.string(), async (id) => {
  if (!isLoggedIn()) error(401);
  const user = requireLogin();
  await db
    .delete(schema.postLike)
    .where(
      and(eq(schema.postLike.post, id), eq(schema.postLike.user, user.id)),
    );
  await Promise.all([getPostLikes(id).refresh(), isPostLiked(id).refresh()]);
});

export const getPostLikes = query(z.string(), (id) => {
  return db.$count(schema.postLike, eq(schema.postLike.post, id));
});

export const isPostLiked = query(z.string(), (id) => {
  if (!isLoggedIn()) return false;
  const user = requireLogin();
  return db
    .select()
    .from(schema.postLike)
    .where(and(eq(schema.postLike.post, id), eq(schema.postLike.user, user.id)))
    .then((res) => res.length > 0);
});

export const getPostCommentCount = query(z.string(), (id) => {
  return db.$count(schema.postComment, eq(schema.postComment.post, id));
});

export const getPostComments = query(z.string(), async (id) => {
  return await db
    .select()
    .from(schema.postComment)
    .where(eq(schema.postComment.post, id))
    .orderBy(asc(schema.postComment.postedAt));
});

export const createComment = form(
  z.object({
    post: z.string(),
    content: z.string().max(TEXT_LIMITS.COMMENT_CONTENT),
  }),
  async ({ post, content }) => {
    const user = requireLogin();
    await db.insert(schema.postComment).values({
      id: crypto.randomUUID(),
      post,
      author: user.id,
      content,
      postedAt: new Date(),
    });
    await Promise.all([
      getPostCommentCount(post).refresh(),
      getPostComments(post).refresh(),
    ]);
  },
);

export const editComment = form(
  z.object({
    id: z.string(),
    content: z.string().max(TEXT_LIMITS.COMMENT_CONTENT),
  }),
  async ({ id, content }) => {
    const user = requireLogin();
    const [comment] = await db
      .update(schema.postComment)
      .set({ content })
      .where(
        and(
          eq(schema.postComment.id, id),
          eq(schema.postComment.author, user.id),
        ),
      )
      .returning();
    if (comment) {
      await Promise.all([
        getPostCommentCount(comment.post).refresh(),
        getPostComments(comment.post).refresh(),
      ]);
    }
  },
);

export const deleteComment = command(z.string(), async (id) => {
  const user = requireLogin();
  const [comment] = await db
    .delete(schema.postComment)
    .where(
      and(
        eq(schema.postComment.id, id),
        eq(schema.postComment.author, user.id),
      ),
    )
    .returning();
  if (comment) {
    await Promise.all([
      getPostCommentCount(comment.post).refresh(),
      getPostComments(comment.post).refresh(),
    ]);
  }
});

export const createPost = form(
  z.object({
    content: z.string().max(TEXT_LIMITS.POST_CONTENT),
    pet: z.string().optional(),
    file: bunFileSchema().or(z.literal("undefined").transform(() => undefined)),
  }),
  async ({ content, pet, file }) => {
    const user = requireLogin();
    await posts.createPost({
      author: user.id,
      content,
      pet: pet && pet.length > 0 ? pet : undefined,
      file,
    });
    await getPosts({}).refresh();
  },
);

export const editPost = form(
  z.object({
    id: z.string(),
    content: z.string().max(TEXT_LIMITS.POST_CONTENT),
  }),
  async ({ id, content }) => {
    const user = requireLogin();
    await db
      .update(schema.post)
      .set({ content })
      .where(and(eq(schema.post.id, id), eq(schema.post.author, user.id)));
    await getPosts({}).refresh();
  },
);

export const deletePost = command(z.string(), async (id) => {
  const user = requireLogin();
  await db
    .delete(schema.post)
    .where(and(eq(schema.post.id, id), eq(schema.post.author, user.id)));
  await PublicStorage.delete(POST_IMAGE_PREFIX + id);
  await getPosts({}).refresh();
});

export const getPostFileType = query(z.string(), async (id) => {
  try {
    return (await PublicStorage.stat(POST_IMAGE_PREFIX + id)).type;
  } catch {
    return undefined;
  }
});
