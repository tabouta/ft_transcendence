import { redirect } from "@sveltejs/kit";
import { getCurrentUser } from "$lib/server/auth.js";

export const load = () => {
  if (getCurrentUser()) {
    redirect(302, "/feed");
  }
};
