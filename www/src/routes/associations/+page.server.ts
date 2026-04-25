import { eq, getTableColumns } from "drizzle-orm";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const searchQuery = url.searchParams.get("search")?.toLowerCase() || "";
  const selectedType =
    schema.associationTypeSchema.safeParse(url.searchParams.get("type")).data ??
    undefined;
  const cityCode = url.searchParams.get("city");
  const selectedCity = cityCode
    ? db.select().from(schema.city).where(eq(schema.city.code, cityCode))
    : undefined;
  const sortBy = (() => {
    const sortBy = url.searchParams.get("sort");
    if (
      !sortBy ||
      !Object.keys(getTableColumns(schema.association)).find(
        (key) => key === sortBy,
      )
    )
      return "name";
    return sortBy as "name" | "type";
  })();

  return {
    associationTypes: schema.associationType.enumValues,
    cities: db.select().from(schema.city).orderBy(schema.city.name),
    filters: {
      search: searchQuery,
      type: selectedType,
      city: selectedCity,
      sort: sortBy,
    },
  };
};
