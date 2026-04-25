import { error } from "@sveltejs/kit";
import { getCity } from "$lib/city.remote";
import { getPet } from "$lib/pets.remote";
import { promiseToRemoteQuery } from "$lib/typeUtils";
import { getUser } from "$lib/user.remote";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  data: { currentUser, cities },
  params: { id },
}) => {
  const pet = getPet(id);
  const loadedPet = await pet;
  if (!loadedPet) error(404);
  const owner = getUser(loadedPet.ownerId);
  const loadedOwner = await owner;
  if (!loadedOwner) error(404);
  return {
    currentUser,
    cities,
    pet: promiseToRemoteQuery(pet),
    owner: promiseToRemoteQuery(owner),
    city: promiseToRemoteQuery(getCity(loadedOwner.city)),
  };
};
