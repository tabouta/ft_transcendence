import { error, redirect } from "@sveltejs/kit";
import { and, eq, getTableColumns, ilike, inArray, or } from "drizzle-orm";
import z from "zod";
import { resolve } from "$app/paths";
import { command, form, query } from "$app/server";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import * as pets from "$lib/server/pets";
import { PublicStorage } from "$lib/server/storage";
import { PET_AVATAR_PREFIX } from "$lib/storage";
import { TEXT_LIMITS } from "$lib/textLimits";
import { getPetOwner } from "./server/pets";
import { bunFileSchema } from "./zodUtils";

export const getPet = query.batch(z.string(), async (pets) => {
  const result = await db
    .select()
    .from(schema.pet)
    .where(inArray(schema.pet.id, pets));
  const lookup = new Map(result.map((pet) => [pet.id, pet]));
  return (pet) => lookup.get(pet);
});

export const getPets = query(
  z.object({
    owner: z.string().optional(),
    search: z.string(),
    species: schema.petSpeciesSchema.optional(),
    city: z.string().optional(),
    sortBy: z.enum(["name", "species"]),
    offset: z.int().optional(),
    limit: z.int().optional(),
  }),
  ({ owner, search, species, city, sortBy, offset, limit }) => {
    const query = db
      .select(getTableColumns(schema.pet))
      .from(schema.pet)
      .innerJoin(
        schema.userPublic,
        eq(schema.userPublic.id, schema.pet.ownerId),
      )
      .where(
        and(
          or(
            ilike(schema.pet.name, `%${search}%`),
            ilike(schema.userPublic.firstName, `%${search}%`),
            ilike(schema.userPublic.lastName, `%${search}%`),
            ilike(schema.userPublic.name, `%${search}%`),
          ),
          owner ? eq(schema.pet.ownerId, owner) : undefined,
          species ? eq(schema.pet.species, species) : undefined,
          city ? eq(schema.userPublic.city, city) : undefined,
        ),
      )
      .orderBy(sortBy === "name" ? schema.pet.name : schema.pet.species)
      .$dynamic();
    if (offset) query.offset(offset);
    if (limit) query.limit(limit);
    return query;
  },
);

export const getPetsCount = query(
  z.object({
    owner: z.string().optional(),
    search: z.string(),
    species: schema.petSpeciesSchema.optional(),
    city: z.string().optional(),
    sortBy: z.enum(["name", "species"]),
  }),
  async (params) => (await getPets(params)).length,
);

export const createPet = form(
  z.object({
    name: z.string().max(TEXT_LIMITS.PET_NAME),
    birth: z.iso.date().transform((birth) => new Date(birth)),
    description: z.string().max(TEXT_LIMITS.PET_DESCRIPTION),
    species: schema.petSpeciesSchema,
    breed: z.string(),
    avatar: bunFileSchema(),
  }),
  async (pet) => {
    const user = requireLogin();
    const { id } = await pets.createPet({ ...pet, ownerId: user.id });
    redirect(303, resolve(`/pets/${id}`));
  },
);

export const updatePet = form(
  z.object({
    id: z.string(),
    name: z.string().max(TEXT_LIMITS.PET_NAME),
    description: z.string().max(TEXT_LIMITS.PET_DESCRIPTION),
    avatar: bunFileSchema().optional(),
    removeAvatar: z.stringbool(),
  }),
  async (pet) => {
    const owner = await getPetOwner(pet);
    if (owner?.id !== requireLogin().id) {
      error(403);
    }
    await pets.updatePet(pet.id, { ...pet });
    await getPet(pet.id).refresh();
  },
);

export const deletePet = command(z.string(), async (petId) => {
  const user = requireLogin();

  const [pet] = await db
    .select()
    .from(schema.pet)
    .where(eq(schema.pet.id, petId));
  if (!pet) {
    error(404);
  }

  if (pet.ownerId !== user.id) {
    error(401);
  }

  await PublicStorage.delete(PET_AVATAR_PREFIX + petId);
  await db.delete(schema.pet).where(eq(schema.pet.id, petId));
});
