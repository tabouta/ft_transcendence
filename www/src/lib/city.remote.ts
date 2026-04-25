import { inArray } from "drizzle-orm";
import z from "zod";
import { query } from "$app/server";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";

export const getCity = query.batch(z.string(), async (codes) => {
  const result = await db
    .select()
    .from(schema.city)
    .where(inArray(schema.city.code, codes));
  const lookup = new Map(result.map((city) => [city.code, city]));
  return (city) => lookup.get(city);
});
