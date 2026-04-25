import { getTableColumns } from "drizzle-orm";
import * as schema from "$lib/server/db/schema";

export const {
  apiKey,
  passwordHash,
  person,
  association,
  ...userColumns // TODO get rid of this
} = getTableColumns(schema.user);
