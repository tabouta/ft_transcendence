import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { getPerson } from "$lib/persons.remote";
import { getApiUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { updatePerson } from "$lib/server/persons";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params: { id } }) => {
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  const person = await getPerson(id);
  if (!person) {
    error(404);
  }
  return new Response(JSON.stringify(person));
};

export const PUT: RequestHandler = async ({ params: { id }, request }) => {
  const user = getApiUser();
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  if (user.id !== id) {
    error(403);
  }
  const formData = Object.fromEntries((await request.formData()).entries());
  const parsed = z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      description: z.string().optional(),
      city: z.string().optional(),
      avatar: z.file().optional(),
      removeAvatar: z.stringbool().default(false),
    })
    .strict()
    .safeParse(formData);
  if (parsed.success) {
    const updated = await updatePerson(id, { ...parsed.data });
    if (!updated) {
      error(404);
    }
    return new Response(JSON.stringify(updated));
  } else {
    error(400, parsed.error);
  }
};

export const DELETE: RequestHandler = async ({ params: { id } }) => {
  const user = getApiUser();
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  if (user.id !== id) {
    error(403);
  }
  const deleted = (
    await db
      .delete(schema.user)
      .where(and(eq(schema.user.id, id)))
      .returning()
  ).at(0);
  if (!deleted) {
    error(404);
  }
  return new Response();
};
