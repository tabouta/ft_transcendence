import { error } from "@sveltejs/kit";
import z from "zod";
import { getPersons } from "$lib/persons.remote";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get("q") ?? "";
  const city = url.searchParams.get("city") ?? undefined;
  const sortByParse = z.safeParse(
    z.enum(["firstName", "lastName"]),
    url.searchParams.get("sortBy") ?? "lastName",
  );
  const sortBy = sortByParse.success ? sortByParse.data : error(400);
  const persons = await getPersons({ search, city, sortBy });
  return new Response(JSON.stringify(persons));
};
