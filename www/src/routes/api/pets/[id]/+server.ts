import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { getPet } from "$lib/pets.remote";
import { getApiUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { getPetOwner, updatePet } from "$lib/server/pets";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params: { id } }) => {
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  const pet = await getPet(id);
  if (!pet) {
    error(404);
  }
  return new Response(JSON.stringify(pet));
};

export const PUT: RequestHandler = async ({ params: { id }, request }) => {
  const user = getApiUser();
  if (!z.uuidv4().safeParse(id).success) {
    error(400);
  }
  const owner = await getPetOwner({ id });
  if (user.id !== owner.id) {
    error(403);
  }
  const formData = Object.fromEntries((await request.formData()).entries());
  const parsed = z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      avatar: z.file().optional(),
      removeAvatar: z.stringbool().default(false),
    })
    .strict()
    .safeParse(formData);
  if (parsed.success) {
    const updated = await updatePet(id, parsed.data);
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
  const owner = await getPetOwner({ id });
  if (user.id !== owner.id) {
    error(403);
  }
  const deleted = (
    await db
      .delete(schema.pet)
      .where(and(eq(schema.pet.id, id)))
      .returning()
  ).at(0);
  if (!deleted) {
    error(404);
  }
  return new Response();
};
