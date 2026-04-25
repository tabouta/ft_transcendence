import z from "zod";

/**
 * Fixes a Bun related bug
 * [GitHub issue](https://github.com/sveltejs/kit/issues/15018)
 */
export const bunFileSchema = () => z.custom<File>((f) => f instanceof Blob);
