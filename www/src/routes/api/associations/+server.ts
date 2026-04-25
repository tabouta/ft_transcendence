import { error } from "@sveltejs/kit";
import z from "zod";
import { getAssociations } from "$lib/associations.remote";
import * as schema from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get("q") ?? "";
  const city = url.searchParams.get("city") ?? undefined;
  const typeParse = z.safeParse(
    schema.associationTypeSchema.optional(),
    url.searchParams.get("type") ?? undefined,
  );
  const type = typeParse.success ? typeParse.data : error(400);
  const sortByParse = z.safeParse(
    z.enum(["name", "type"]),
    url.searchParams.get("sortBy") ?? "name",
  );
  const sortBy = sortByParse.success ? sortByParse.data : error(400);
  const associations = await getAssociations({ search, type, city, sortBy });
  return new Response(JSON.stringify(associations));
};
