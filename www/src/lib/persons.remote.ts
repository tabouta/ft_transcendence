import { error } from "@sveltejs/kit";
import { and, eq, getTableColumns, ilike, inArray, or } from "drizzle-orm";
import z from "zod";
import { form, query } from "$app/server";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import * as persons from "$lib/server/persons";
import { TEXT_LIMITS } from "$lib/textLimits";
import { bunFileSchema } from "./zodUtils";

export const getPerson = query.batch(z.string(), async (persons) => {
  const result = await db
    .select({
      ...getTableColumns(schema.person),
      city: getTableColumns(schema.city),
    })
    .from(schema.person)
    .where(inArray(schema.person.id, persons))
    .innerJoin(schema.city, eq(schema.city.code, schema.person.city));
  const lookup = new Map(result.map((person) => [person.id, person]));
  return (person) => lookup.get(person);
});

export const getPersons = query(
  z.object({
    search: z.string(),
    city: z.string().optional(),
    sortBy: z.enum(["firstName", "lastName"]),
    offset: z.int().optional(),
    limit: z.int().optional(),
  }),
  ({ search, city, sortBy, offset, limit }) => {
    const query = db
      .select({
        ...getTableColumns(schema.person),
        city: getTableColumns(schema.city),
      })
      .from(schema.person)
      .where(
        and(
          or(
            ilike(schema.person.firstName, `%${search}%`),
            ilike(schema.person.lastName, `%${search}%`),
          ),
          city ? eq(schema.person.city, city) : undefined,
        ),
      )
      .innerJoin(schema.city, eq(schema.city.code, schema.person.city))
      .orderBy(
        sortBy === "firstName"
          ? schema.person.firstName
          : schema.person.lastName,
      )
      .$dynamic();
    if (offset) query.offset(offset);
    if (limit) query.limit(limit);
    return query;
  },
);

export const getPersonsCount = query(
  z.object({
    search: z.string(),
    city: z.string().optional(),
    sortBy: z.enum(["firstName", "lastName"]),
  }),
  async (params) => (await getPersons(params)).length,
);

export const updatePerson = form(
  z.object({
    id: z.string(),
    firstName: z.string().max(TEXT_LIMITS.USER_FIRST_NAME),
    lastName: z.string().max(TEXT_LIMITS.USER_LAST_NAME),
    description: z.string().max(TEXT_LIMITS.USER_DESCRIPTION),
    city: z.string(),
    avatar: bunFileSchema().optional(),
    removeAvatar: z.stringbool(),
  }),
  async (person) => {
    if (person.id !== requireLogin().id) {
      error(403);
    }
    await persons.updatePerson(person.id, person);
    await getPerson(person.id).refresh();
  },
);
