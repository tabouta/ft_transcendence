import { eq, isNotNull, lt, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  pgView,
  point,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { coalesce } from "../../queryUtils";

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type Session = typeof session.$inferSelect;

export const gdprTokenAction = pgEnum("gdpr_token_action", [
  "export",
  "delete",
]);

export const gdprTokenActionSchema = createSelectSchema(gdprTokenAction);
export type GdprTokenAction = (typeof gdprTokenAction.enumValues)[number];

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey(),
    apiKey: text("api_key").unique().notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    online: boolean("online").notNull(),
    gdprToken: text("gdpr_token"),
    gdprTokenExpiresAt: timestamp("gdpr_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    gdprTokenAction: gdprTokenAction("gdpr_token_action"),
    person: uuid("person").references(() => person.id),
    association: uuid("association").references(() => association.id),
  },
  (table) => [
    check(
      "unique_profile",
      sql`num_nonnulls(${table.person}, ${table.association}) = 1`,
    ),
  ],
);

export type User = typeof user.$inferSelect;

export const person = pgTable("person", {
  id: uuid("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  description: text("description").notNull(),
  city: text("city")
    .references(() => city.code)
    .notNull(),
  hasAvatar: boolean("has_avatar").notNull(),
  joinedAt: timestamp("joined_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export type Person = typeof person.$inferSelect;

export const associationType = pgEnum("association_type", [
  "Sanctuary",
  "Rescue",
  "Adoption",
  "Care",
]);

export const associationTypeSchema = createSelectSchema(associationType);
export type AssociationType = (typeof associationType.enumValues)[number];

export const association = pgTable("association", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  description: text("description").notNull(),
  city: text("city")
    .references(() => city.code)
    .notNull(),
  hasAvatar: boolean("has_avatar").notNull(),
  type: associationType("type").notNull(),
  foundedAt: timestamp("founded_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type Association = typeof association.$inferSelect;

export type PersonOrAssociation =
  | ({ isAssociation: false } & Person)
  | ({ isAssociation: true } & Association);

export const userPublic = pgView("user_public").as((qb) => {
  const query = qb
    .select({
      id: user.id,
      email: user.email,
      online: user.online,
      isAssociation: isNotNull(user.association)
        .mapWith(Boolean)
        .as("is_association"),

      description: coalesce(person.description, association.description).as(
        "description",
      ),
      city: coalesce(person.city, association.city).as("city"),
      hasAvatar: coalesce(person.hasAvatar, association.hasAvatar).as(
        "has_avatar",
      ),

      firstName: person.firstName,
      lastName: person.lastName,
      joinedAt: person.joinedAt,

      name: association.name,
      phone: association.phone,
      type: association.type,
      foundedAt: association.foundedAt,
    })
    .from(user)
    .leftJoin(person, eq(user.id, person.id))
    .leftJoin(association, eq(user.id, association.id));
  return query;
});

export type UserPublic = Omit<
  typeof userPublic.$inferSelect,
  "isAssociation" | keyof Person | keyof Association
> &
  PersonOrAssociation;

export const petSpecies = pgEnum("pet_species", [
  "Cat",
  "Cow",
  "Dog",
  "Fish",
  "Horse",
]);

export const petSpeciesSchema = createSelectSchema(petSpecies);
export type PetSpecies = (typeof petSpecies.enumValues)[number];

export const pet = pgTable("pet", {
  id: uuid("id").primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: petSpecies("species").notNull(),
  breed: text("breed").notNull(),
  birth: timestamp("birth", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  description: text("description").notNull(),
  hasAvatar: boolean("has_avatar").notNull(),
});

export type Pet = typeof pet.$inferSelect;

export const usersPair = pgTable(
  "users_pair",
  {
    id: uuid("id").notNull().unique(),
    left: uuid("left")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    right: uuid("right")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    friends: boolean().notNull(),
    pending: uuid().references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.left, table.right] }),
    check("ids_order", lt(table.left, table.right)),
  ],
);

export type UsersPair = typeof usersPair.$inferSelect;

export const chatMessage = pgTable("chat_message", {
  id: uuid("id").primaryKey(),
  friendsId: uuid("friends_id")
    .notNull()
    .references(() => usersPair.id, { onDelete: "cascade" }),
  author: uuid("author")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isFile: boolean().notNull(),
  read: boolean().notNull(),
  sentAt: timestamp("sent_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type ChatMessage = typeof chatMessage.$inferSelect;

export const post = pgTable("post", {
  id: uuid("id").primaryKey(),
  author: uuid("author")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  hasFile: boolean("has_file").notNull(),
  pet: uuid("pet").references(() => pet.id, { onDelete: "cascade" }),
  postedAt: timestamp("posted_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type Post = typeof post.$inferSelect;

export const postLike = pgTable(
  "post_like",
  {
    post: uuid("post")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    user: uuid("user")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.post, table.user] })],
);

export type PostLike = typeof postLike.$inferSelect;

export const postComment = pgTable("post_comment", {
  id: uuid("id").primaryKey(),
  post: uuid("post")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  author: uuid("author")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  postedAt: timestamp("posted_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type PostComment = typeof postComment.$inferSelect;

export const city = pgTable(
  "city",
  {
    code: text("code").primaryKey(),
    name: text("name").notNull(),
    location: point("location", { mode: "tuple" }).notNull(),
  },
  (table) => [index("spatial_index").using("gist", table.location)],
);

export type City = typeof city.$inferSelect;
