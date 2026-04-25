import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({
  species: db
    .selectDistinct({ name: schema.pet.species })
    .from(schema.pet)
    .orderBy(schema.pet.species),
});
