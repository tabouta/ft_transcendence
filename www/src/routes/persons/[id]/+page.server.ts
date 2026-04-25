import { getCurrentUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
  currentUser: getCurrentUser() ?? undefined,
  cities: db.select().from(schema.city).orderBy(schema.city.name),
});
