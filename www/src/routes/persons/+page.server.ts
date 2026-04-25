import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({
  cities: db.select().from(schema.city).orderBy(schema.city.name),
});

export const trailingSlash = "always";
