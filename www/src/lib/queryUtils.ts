import { type Column, type GetColumnData, type SQL, sql } from "drizzle-orm";
import type {
  Association,
  Person,
  PersonOrAssociation,
} from "$lib/server/db/schema";

export function formatWithOwner<T>({
  owned,
  ownerPerson,
  ownerAssociation,
}: {
  owned: T;
  ownerPerson: Person | null;
  ownerAssociation: Association | null;
}) {
  return {
    ...owned,
    owner: (ownerPerson
      ? { isAssociation: false, ...ownerPerson }
      : {
          isAssociation: true,
          ...ownerAssociation,
        }) as PersonOrAssociation,
  };
}

type AnySql = SQL | Column;
type Coalesce<Array extends AnySql[]> = Array extends [
  ...infer Optionals,
  infer Last,
]
  ?
      | Exclude<ExtractSqlType<Optionals[number]>, null | undefined>
      | ExtractSqlType<Last>
  : never;
type ExtractSqlType<S> =
  S extends SQL<infer T>
    ? T
    : S extends Column
      ? GetColumnData<S, "query">
      : never;

/**
 * Copied from [here](https://github.com/drizzle-team/drizzle-orm/issues/3708#issuecomment-3282649813)
 */
export function coalesce<Args extends [AnySql, AnySql, ...AnySql[]]>(
  ...args: Args
) {
  return sql<Coalesce<Args>>`coalesce(${sql.join(
    args.map((a) => sql`${a}`),
    sql.raw(","),
  )})`;
}
