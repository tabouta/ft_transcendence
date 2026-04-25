import type { User, UserPublic } from "$lib/server/db/schema";

export function getFullName(user: UserPublic) {
  return user.isAssociation ? user.name : `${user.firstName} ${user.lastName}`;
}

export function getProfileUrl(
  user: User | UserPublic,
): `/associations/${string}` | `/persons/${string}` {
  if (typeof user === "object" && "isAssociation" in user) {
    return `/${user.isAssociation ? "associations" : "persons"}/${user.id}`;
  } else {
    return `/${user.association ? "associations" : "persons"}/${user.id}`;
  }
}

export function getFriendsUrl(
  user: User | UserPublic,
): `${ReturnType<typeof getProfileUrl>}/friends` {
  return `${getProfileUrl(user)}/friends`;
}
