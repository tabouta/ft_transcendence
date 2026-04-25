import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Data export is now email-confirmed — see /settings/gdpr/confirm/[token]
export const GET: RequestHandler = () => redirect(302, "/settings");
