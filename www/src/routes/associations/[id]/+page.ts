import { error } from "@sveltejs/kit";
import { promiseToRemoteQuery } from "$lib/typeUtils";
import { getUser } from "$lib/user.remote";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  data: { currentUser, cities },
  params: { id },
}) => {
  const user = getUser(id);
  const associationResult = await user;
  if (!associationResult || !associationResult.isAssociation) error(404);
  return {
    currentUser,
    cities,
    association: promiseToRemoteQuery(user),
  };
};
