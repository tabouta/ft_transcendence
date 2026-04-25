import { error } from "@sveltejs/kit";
import { PublicStorage } from "$lib/server/storage";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params: { key } }) => {
  const file = PublicStorage.get(key);
  if (!(await file.exists())) {
    error(404);
  }
  return new Response(file.stream());
};
