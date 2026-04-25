import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

if (!process.env.PORT) {
  throw "Missing PORT environment variable";
}

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: Number(process.env.PORT),
  },
});
