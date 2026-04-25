import { getCurrentUser } from "$lib/server/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => ({
  currentUser: getCurrentUser(),
});
