import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./lib/server/db/schema";
import { PrivateStorage } from "./lib/server/storage";
import { MESSAGE_FILE_PREFIX } from "./lib/storage";

if (!process.env.POSTGRES_USER)
  throw "Missing POSTGRES_USER environment variable";
if (!process.env.POSTGRES_PASSWORD)
  throw "Missing POSTGRES_PASSWORD environment variable";
if (!process.env.POSTGRES_HOST)
  throw "Missing POSTGRES_HOST environment variable";
if (!process.env.POSTGRES_DB) throw "Missing POSTGRES_DB environment variable";
if (!process.env.PUBLIC_MAX_FILE_SIZE)
  throw "Missing PUBLIC_MAX_FILE_SIZE environment variable";

const PORT = 3000;

const PRESENCE_PING_INTERVAL = 5000;
const PRESENCE_DISCONNECTION_DELAY = PRESENCE_PING_INTERVAL * 3;

type MessagesData = {
  type: "messages";
  user: schema.UserPublic;
  chatId: string;
};

type PresenceData = {
  type: "presence";
  user: schema.UserPublic;
  interval?: NodeJS.Timeout;
};

type WebSocketData = MessagesData | PresenceData;

const client = postgres(
  `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DB}`,
);
const db = drizzle(client, { schema });

const presence = new Map<string, Date>();

async function updatePresence(id: string) {
  presence.set(id, new Date());
  await db
    .update(schema.user)
    .set({ online: true })
    .where(eq(schema.user.id, id));
}

async function clearPresence(id: string) {
  presence.delete(id);
  await db
    .update(schema.user)
    .set({ online: false })
    .where(eq(schema.user.id, id));
}

const server = Bun.serve({
  port: PORT,
  routes: {
    "/messages/:id": async (req, server) => {
      const sessionToken = req.cookies.get(sessionCookieName);
      if (!sessionToken) {
        return new Response("Not authenticated", { status: 401 });
      }

      const { session, user } = await validateSessionToken(sessionToken);
      if (!session || !user) {
        return new Response("Not authenticated", { status: 401 });
      }

      const [chat] = await db
        .select()
        .from(schema.usersPair)
        .where(
          or(
            and(
              eq(schema.usersPair.left, user.id),
              eq(schema.usersPair.right, req.params.id),
            ),
            and(
              eq(schema.usersPair.left, req.params.id),
              eq(schema.usersPair.right, user.id),
            ),
          ),
        );
      if (!chat) {
        return new Response("Not part of this chat", { status: 403 });
      }

      if (
        server.upgrade(req, {
          data: { type: "messages", user, chatId: chat.id },
        })
      ) {
        return; // Success !
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    "/presence": async (req, server) => {
      const sessionToken = req.cookies.get(sessionCookieName);
      if (!sessionToken) {
        return new Response("Not authenticated", { status: 401 });
      }

      const { session, user } = await validateSessionToken(sessionToken);
      if (!session || !user) {
        return new Response("Not authenticated", { status: 401 });
      }

      if (
        server.upgrade(req, {
          data: { type: "presence", user, interval: undefined },
        })
      ) {
        return; // Success !
      }
      return new Response("Upgrade failed", { status: 500 });
    },
  },
  websocket: {
    data: {} as WebSocketData,
    async open(ws) {
      switch (ws.data.type) {
        case "messages":
          ws.subscribe(`/messages/${ws.data.chatId}`);
          break;
        case "presence":
          ws.data.interval = setInterval(async () => {
            const last = presence.get(ws.data.user.id);
            if (last)
              if (
                last &&
                Date.now() - last.getTime() < PRESENCE_DISCONNECTION_DELAY
              ) {
                ws.send("ping");
              } else {
                if (ws.data.type === "presence")
                  clearInterval(ws.data.interval);
                await clearPresence(ws.data.user.id);
                ws.close();
              }
          }, PRESENCE_PING_INTERVAL);
          await updatePresence(ws.data.user.id);
          ws.send("ping");
          break;
      }
    },
    async message(ws, content) {
      switch (ws.data.type) {
        case "messages": {
          const isFile = content.toString().startsWith("__bin__");
          const message: schema.ChatMessage = {
            id: crypto.randomUUID(),
            friendsId: ws.data.chatId,
            author: ws.data.user.id,
            content: isFile ? "" : content.toString(),
            isFile,
            read: false,
            sentAt: new Date(),
          };
          if (isFile) {
            const buffer = content as Buffer<ArrayBuffer>;
            if (buffer.length > Number(process.env.PUBLIC_MAX_FILE_SIZE)) {
              return; // TODO send an error ?
            }
            if (
              !buffer.subarray(0, 8).compare(
                Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // png file signature
              )
            ) {
              return; // TODO send an error ?
            }
            await PrivateStorage.upload(
              MESSAGE_FILE_PREFIX + message.id,
              new Blob([buffer.subarray(7)]),
              "image/png",
            );
          }
          server.publish(
            `/messages/${ws.data.chatId}`,
            JSON.stringify(message),
          );
          await db.insert(schema.chatMessage).values(message);
          break;
        }
        case "presence":
          await updatePresence(ws.data.user.id);
          break;
      }
    },
    async close(ws) {
      switch (ws.data.type) {
        case "messages":
          ws.unsubscribe(`/messages/${ws.data.chatId}`);
          break;
        case "presence":
          // clearInterval(ws.data.interval);
          // await clearPresence(ws.data.user.id);
          break;
      }
    },
  },
});
console.log(`Websocket server listening on port ${PORT}...`);

// TODO everything below is copy pasted from ./lib/server/auth.ts !

const sessionCookieName = "auth-session";

async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [result] = await db
    .select({
      // Adjust user table here to tweak returned data
      user: schema.user,
      session: schema.session,
    })
    .from(schema.session)
    .innerJoin(schema.user, eq(schema.session.userId, schema.user.id))
    .where(eq(schema.session.id, sessionId));

  if (!result) {
    return { session: undefined, user: undefined };
  }
  const { session, user } = result;

  const sessionExpired = Date.now() >= session.expiresAt.getTime();
  if (sessionExpired) {
    await db.delete(schema.session).where(eq(schema.session.id, session.id));
    return { session: undefined, user: undefined };
  }

  return { session, user: await getUser(user.id) };
}

async function getUser(userId: string) {
  return (
    await db
      .select()
      .from(schema.userPublic)
      .where(eq(schema.userPublic.id, userId))
      .limit(1)
  ).at(0) as schema.UserPublic;
}
