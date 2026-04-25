import { requireLogin } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({ currentUser: requireLogin() });
