import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import z from "zod";
import * as schema from "./schema";

const GEO_API_ENDPOINT = "https://geo.api.gouv.fr/communes";
const CITY_MIN_POPULATION = 100000;

export default async function setup() {
  const client = postgres(
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DB}`,
  );
  const db = drizzle(client, { schema });
  await addTriggers(db);
  await addGeoData(db);
  client.end();
}

async function addTriggers(db: PostgresJsDatabase<typeof schema>) {
  console.log("[ ] Adding triggers...");
  const query = `
CREATE OR REPLACE FUNCTION canonicalize_users_pair() RETURNS trigger AS $$
DECLARE
  tmp UUID;
BEGIN
  IF NEW.left > NEW.right THEN
    tmp := NEW.left;
    NEW.left := NEW.right;
    NEW.right := tmp;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_canonicalize_users_pair
BEFORE INSERT OR UPDATE ON users_pair
FOR EACH ROW EXECUTE FUNCTION canonicalize_users_pair();
  `;
  console.log(query);
  await db.execute(query);
  console.log("[✓] Adding triggers...");
}

async function addGeoData(db: PostgresJsDatabase<typeof schema>) {
  if ((await db.select().from(schema.city)).length > 0) {
    return;
  }
  console.log("[ ] Adding geographic data...");
  console.log(`Fetching all cities in France from ${GEO_API_ENDPOINT}`);
  const dataSchema = z.array(
    z.object({
      code: z.string(),
      nom: z.string(),
      population: z.number().optional(),
      centre: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
    }),
  );
  const fetched = await fetch(
    `${GEO_API_ENDPOINT}?fields=code,nom,population,centre`,
  );
  const parseResult = dataSchema.safeParse(await fetched.json());
  if (!parseResult.success) {
    throw `Invalid data schema: ${parseResult.error}`;
  }
  const data = parseResult.data;
  console.log(`${data.length} cites found`);
  const cities = data
    .filter((city) => city.population && city.population >= CITY_MIN_POPULATION)
    .map((city) => ({
      code: city.code,
      name: city.nom,
      location: city.centre.coordinates,
    }));
  console.log(
    `Inserting ${cities.length} cites with population above ${CITY_MIN_POPULATION}`,
  );
  try {
    await db.insert(schema.city).values(cities);
  } catch {
    throw "Failed to insert geographic data";
  }
  console.log("[✓] Adding geographic data...");
}
