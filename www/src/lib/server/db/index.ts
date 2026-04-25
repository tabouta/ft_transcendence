import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} from "$env/static/private";
import * as schema from "./schema";

const client = postgres(
  `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DB}`,
);

export const db = drizzle(client, { schema });
