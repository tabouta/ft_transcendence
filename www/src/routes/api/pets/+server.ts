import { error } from "@sveltejs/kit";
import z from "zod";
import { getPets } from "$lib/pets.remote";
import { getApiUser } from "$lib/server/auth";
import { petSpeciesSchema } from "$lib/server/db/schema";
import { createPet } from "$lib/server/pets";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get("q") ?? "";
  const owner = url.searchParams.get("owner") ?? undefined;
  const speciesParse = z.safeParse(
    petSpeciesSchema.optional(),
    url.searchParams.get("species") ?? undefined,
  );
  const species = speciesParse.success ? speciesParse.data : error(400);
  const city = url.searchParams.get("city") ?? undefined;
  const sortByParse = z.safeParse(
    z.enum(["name", "species"]),
    url.searchParams.get("sortBy") ?? "name",
  );
  const sortBy = sortByParse.success ? sortByParse.data : error(400);
  const pets = await getPets({ search, owner, species, city, sortBy });
  return new Response(JSON.stringify(pets));
};

export const POST: RequestHandler = async ({ request }) => {
  const user = getApiUser();
  const requestSchema = z
    .object({
      name: z.string(),
      birth: z.coerce.date(),
      description: z.string(),
      species: petSpeciesSchema,
      breed: z.string(),
      avatar: z.file(),
    })
    .strict();
  const formData = Object.fromEntries((await request.formData()).entries());
  const parsed = requestSchema.safeParse(formData);
  if (!parsed.success) {
    error(400, parsed.error);
  }
  const id = await createPet({ ...parsed.data, ownerId: user.id });
  return new Response(JSON.stringify({ id }));
};
