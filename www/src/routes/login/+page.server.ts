import { redirect } from "@sveltejs/kit";
import { isLoggedIn } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  if (isLoggedIn()) redirect(302, "/");
};
