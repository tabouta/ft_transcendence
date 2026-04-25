import { hash, verify } from "@node-rs/argon2";
import { error, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import z from "zod";
import { resolve } from "$app/paths";
import { command, form, getRequestEvent } from "$app/server";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { sendGdprDeleteEmail, sendGdprExportEmail } from "$lib/server/email";
import { TEXT_LIMITS } from "$lib/textLimits";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
    "Password must contain at least one uppercase letter, lowercase letter, digit and special character",
  );

function generateGdprToken() {
  return crypto.randomUUID();
}

async function register(
  id: string,
  email: string,
  password: string,
  isAssociation: boolean,
) {
  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await db.insert(schema.user).values({
    id,
    apiKey: auth.generateSessionToken(), // TODO is this ok ?
    email,
    passwordHash,
    person: isAssociation ? null : id,
    association: isAssociation ? id : null,
    online: false,
  });

  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, id);
  auth.setSessionTokenCookie(
    getRequestEvent(),
    sessionToken,
    session.expiresAt,
  );
}

export const registerPerson = form(
  z.object({
    email: z.email(),
    password: strongPassword,
    firstName: z.string().max(TEXT_LIMITS.USER_FIRST_NAME),
    lastName: z.string().max(TEXT_LIMITS.USER_LAST_NAME),
    city: z.string(),
  }),
  async ({ email, password, firstName, lastName, city }) => {
    const id = crypto.randomUUID();
    try {
      await db.insert(schema.person).values({
        id,
        firstName,
        lastName,
        description: "",
        city,
        hasAvatar: false,
      });
      await register(id, email, password, false);
    } catch {
      error(500, { message: "An error has occurred" });
    }
    redirect(302, resolve(`/persons/${id}`)); // TODO register as association
  },
);

export const registerAssociation = form(
  z.object({
    email: z.email(),
    password: strongPassword,
    name: z.string().max(TEXT_LIMITS.ASSOCIATION_NAME),
    phone: z.string(),
    type: schema.associationTypeSchema,
    foundedAt: z.iso.date().transform((foundedAt) => new Date(foundedAt)),
    city: z.string(),
  }),
  async ({ email, password, name, phone, type, foundedAt, city }) => {
    const id = crypto.randomUUID();
    try {
      await db.insert(schema.association).values({
        id,
        name,
        phone,
        type,
        foundedAt,
        description: "",
        city,
        hasAvatar: false,
      });
      await register(id, email, password, true);
    } catch {
      error(500, { message: "An error has occurred" });
    }
    redirect(302, resolve(`/associations/${id}`)); // TODO register as association
  },
);

export const login = form(
  z.object({ email: z.email(), password: z.string() }),
  async ({ email, password }) => {
    const results = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email));

    const existingUser = results.at(0);
    if (!existingUser) {
      return error(400, { message: "Incorrect username or password" });
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return error(400, { message: "Incorrect username or password" });
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser.id);
    auth.setSessionTokenCookie(
      getRequestEvent(),
      sessionToken,
      session.expiresAt,
    );

    return redirect(302, "/");
  },
);

export const logout = command(async (): Promise<void> => {
  const event = getRequestEvent();
  if (!event.locals.session) {
    return error(401);
  }
  await auth.invalidateSession(event.locals.session.id);
  auth.deleteSessionTokenCookie(event);
});

export const updateCredentials = form(
  z.object({
    currentPassword: z.string(),
    email: z.email().or(z.string().max(0)).optional(),
    password: strongPassword.or(z.literal("")).optional(),
  }),
  async ({ currentPassword, email, password }) => {
    if (email?.length === 0) email = undefined;
    if (password?.length === 0) password = undefined;

    const userId = getRequestEvent().locals.user?.id;
    if (!userId) {
      redirect(302, "/login");
    }
    const [user] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId));
    if (!userId) {
      redirect(302, "/login");
    }

    //TODO extract to function (present in login)
    const validPassword = await verify(user.passwordHash, currentPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return error(400, { message: "Incorrect username or password" });
    }

    const passwordHash = password
      ? await hash(password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        })
      : undefined;

    await db
      .update(schema.user)
      .set({ email, passwordHash })
      .where(eq(schema.user.id, user.id));
  },
);

export const requestGdprExport = form(z.object({}), async () => {
  const user = auth.requireLogin();
  const token = generateGdprToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db
    .update(schema.user)
    .set({
      gdprToken: token,
      gdprTokenExpiresAt: expiresAt,
      gdprTokenAction: "export",
    })
    .where(eq(schema.user.id, user.id));

  const event = getRequestEvent();
  await sendGdprExportEmail(
    user.email,
    `${event.url.origin}/settings/gdpr/confirm/${token}`,
  );

  redirect(302, "/settings/gdpr/requested");
});

export const deleteAccount = form(
  z.object({
    password: z.string(),
  }),
  async ({ password }) => {
    const userId = getRequestEvent().locals.user?.id;
    if (!userId) {
      redirect(302, "/login");
    }
    const [user] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId));
    if (!userId) {
      redirect(302, "/login");
    }

    const validPassword = await verify(user.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return error(400, { message: "Incorrect username or password" });
    }

    const token = generateGdprToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db
      .update(schema.user)
      .set({
        gdprToken: token,
        gdprTokenExpiresAt: expiresAt,
        gdprTokenAction: "delete",
      })
      .where(eq(schema.user.id, user.id));

    const event = getRequestEvent();
    await sendGdprDeleteEmail(
      user.email,
      `${event.url.origin}/settings/gdpr/confirm/${token}`,
    );

    redirect(302, "/settings/gdpr/requested");
  },
);
