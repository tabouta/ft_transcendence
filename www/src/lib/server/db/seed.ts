import { faker } from "@faker-js/faker";
import { hash } from "@node-rs/argon2";
import { eq, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { reset } from "drizzle-seed";
import postgres from "postgres";
import type {
  Association,
  ChatMessage,
  Person,
  Pet,
  Post,
  PostComment,
  PostLike,
  User,
  UsersPair,
} from "./schema";
import * as schema from "./schema";
import seedTexts from "./seed-texts.json";

const N_USERS = 30;

export default async function seedDb() {
  const client = postgres(
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DB}`,
  );
  const db = drizzle(client, { schema });
  const { city, ...tables } = schema;
  const cities = await db.select().from(city);
  console.log("Resetting database...");
  await reset(db, tables);
  console.log("Generating new data...");
  faker.seed(0);
  const users: User[] = [];
  const persons: Person[] = [];
  const associations: Association[] = [];
  const pets: Pet[] = [];
  const posts: Post[] = [];
  const postComments: PostComment[] = [];
  const postLikes: PostLike[] = [];
  const usersPairs: UsersPair[] = [];
  const chatMessages: ChatMessage[] = [];
  const userIds = Array.from({ length: N_USERS }, () => faker.string.uuid());
  for (const userId of userIds) {
    const isAssociation = faker.datatype.boolean({ probability: 0.2 });
    if (isAssociation) {
      associations.push({
        id: userId,
        name: faker.company.name(),
        city: faker.helpers.arrayElement(cities.map((city) => city.code)),
        description: faker.company.catchPhrase(),
        foundedAt: faker.date.past({ years: 25 }),
        phone: faker.phone.number({ style: "international" }),
        hasAvatar: true,
        type: faker.helpers.arrayElement(schema.associationType.enumValues),
      });
    } else {
      persons.push({
        id: userId,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        description: faker.helpers.arrayElement(seedTexts.userBios),
        city: faker.helpers.arrayElement(cities.map((city) => city.code)),
        hasAvatar: true,
        joinedAt: new Date(),
      });
    }
    users.push({
      id: userId,
      apiKey: faker.string.sample({ min: 24, max: 24 }),
      email: faker.internet.email(),
      passwordHash: await hash(faker.internet.password(), {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }),
      person: isAssociation ? null : userId,
      association: isAssociation ? userId : null,
      online: false,
      gdprToken: null,
      gdprTokenExpiresAt: null,
      gdprTokenAction: null,
    });
    const petIds = [];
    for (
      let i = 0;
      i <
      faker.number.int({
        min: isAssociation ? 5 : 0,
        max: isAssociation ? 25 : 5,
      });
      i++
    ) {
      const petId = faker.string.uuid();
      petIds.push(petId);
      pets.push({
        id: petId,
        ownerId: userId,
        name: faker.animal.petName(),
        species: faker.helpers.arrayElement([
          "Cat",
          "Dog",
          "Cow",
          "Fish",
          "Horse",
        ]),
        breed: faker.helpers.arrayElement([
          "Red",
          "Orange",
          "Black",
          "White",
          "Green",
        ]),
        description: faker.helpers.arrayElement(seedTexts.petBios),
        birth: faker.date.past({ years: 12 }),
        hasAvatar: false,
      });
    }
    for (
      let i = 0;
      i <
      faker.number.int({
        min: isAssociation ? 10 : 0,
        max: isAssociation ? 25 : 10,
      });
      i++
    ) {
      const postId = faker.string.uuid();
      posts.push({
        id: postId,
        author: userId,
        pet:
          faker.datatype.boolean({ probability: 0.8 }) && petIds.length > 0
            ? faker.helpers.arrayElement(petIds)
            : null,
        content: faker.helpers.arrayElement(seedTexts.postContents),
        hasFile: true,
        postedAt: faker.date.past({ years: 3 }),
      });
      for (let j = 0; j < faker.number.int({ min: 0, max: 10 }); j++) {
        postComments.push({
          id: faker.string.uuid(),
          author: faker.helpers.arrayElement(userIds),
          post: postId,
          content: faker.helpers.arrayElement(seedTexts.postContents),
          postedAt: faker.date.past({ years: 3 }),
        });
      }
      const userIdsLeft = [...userIds];
      for (
        let j = 0;
        j < faker.number.int({ min: 0, max: 10 }) && userIdsLeft.length > 0;
        j++
      ) {
        const userIdLike = userIdsLeft.splice(
          Math.floor(Math.random() * (userIdsLeft.length - 1)),
          1,
        )[0];
        postLikes.push({
          post: postId,
          user: userIdLike,
        });
      }
    }
  }
  const usersPairIds = Array.from({ length: N_USERS * 10 }, () =>
    faker.string.uuid(),
  );
  for (const usersPairId of usersPairIds) {
    const generatePair = () => ({
      left: faker.helpers.arrayElement(userIds),
      right: faker.helpers.arrayElement(userIds),
    });
    let pair: { left: string; right: string };
    do {
      pair = generatePair();
    } while (
      pair.left === pair.right ||
      usersPairs.find(
        ({ left, right }) =>
          (left === pair.left && right === pair.right) ||
          (left === pair.right && right === pair.left),
      ) !== undefined
    );
    const friends = faker.datatype.boolean({ probability: 0.8 });
    usersPairs.push({
      id: usersPairId,
      left: pair.left,
      right: pair.right,
      friends,
      pending: friends
        ? null
        : faker.helpers.arrayElement([pair.left, pair.right]),
    });
    for (let i = 0; i < faker.number.int({ min: 0, max: 10 }); i++) {
      chatMessages.push({
        id: faker.string.uuid(),
        friendsId: usersPairId,
        author: faker.helpers.arrayElement([pair.left, pair.right]),
        content: faker.helpers.arrayElement(seedTexts.chatMessages),
        isFile: false,
        read: true,
        sentAt: faker.date.past({ years: 3 }),
      });
    }
  }
  console.log("Seeding database...");
  await db.insert(schema.person).values(persons);
  await db.insert(schema.association).values(associations);
  await db.insert(schema.user).values(users);
  await db.insert(schema.pet).values(pets);
  await db.insert(schema.post).values(posts);
  await db.insert(schema.postComment).values(postComments);
  await db.insert(schema.postLike).values(postLikes);
  await db.insert(schema.usersPair).values(usersPairs);
  await db.insert(schema.chatMessage).values(chatMessages);
  console.log("Inserting default entries...");
  const [userA, userB] = await db
    .select()
    .from(schema.user)
    .where(isNotNull(schema.user.person))
    .limit(2);
  await db
    .update(schema.user)
    .set({
      apiKey: "_-t0BC96e_-oogPYwDDixcvO",
      email: "mszymcza@student.42.fr",
      // TODO refactor this
      passwordHash: await hash("mszymcza", {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }),
    })
    .where(eq(schema.user.id, userA.id));
  await db
    .update(schema.person)
    .set({
      firstName: "Maïa",
      lastName: "Szymczak",
      description: "Cat person",
      hasAvatar: true,
    })
    .where(eq(schema.person.id, userA.id));
  await db
    .update(schema.user)
    .set({
      apiKey: "9MLdflaYQesOWbMapFEiYdiC",
      email: "aheisch@student.42.fr",
      // TODO refactor this
      passwordHash: await hash("aheisch", {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }),
    })
    .where(eq(schema.user.id, userB.id));
  await db
    .update(schema.person)
    .set({
      firstName: "Adrien",
      lastName: "Heisch",
      description: "Dog person",
      hasAvatar: true,
    })
    .where(eq(schema.person.id, userB.id));
  const [userC] = await db
    .select()
    .from(schema.user)
    .where(isNotNull(schema.user.association))
    .limit(1);
  await db
    .update(schema.user)
    .set({
      apiKey: "BVsZmVvjt_eXElFqE80AVj0p",
      email: "bibisfarm@student.42.fr",
      // TODO refactor this
      passwordHash: await hash("bibisfarm", {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }),
    })
    .where(eq(schema.user.id, userC.id));
  await db
    .update(schema.association)
    .set({
      name: "Bibi's Farm",
      description: "We do indeed like pets",
    })
    .where(eq(schema.association.id, userC.id));
  console.log("Done");
  client.end();
}
