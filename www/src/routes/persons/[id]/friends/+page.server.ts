import { error } from "@sveltejs/kit";
import { getPerson } from "$lib/persons.remote";
import { getCurrentUser } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params: { id: user } }) => ({
  currentUser: getCurrentUser(),
  user: (await getPerson(user)) ?? error(404),
});
