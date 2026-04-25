import type { PetSpecies } from "$lib/server/db/schema";

export const SPECIES_ICONS = new Map<PetSpecies, string>([
  ["Cat", "🐈"],
  ["Cow", "🐄"],
  ["Dog", "🐕"],
  ["Fish", "🐟"],
  ["Horse", "🐴"],
]);

export const SPECIES_DEFAULT_ICON = "🐾";
