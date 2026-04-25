<script lang="ts">
import { fly } from "svelte/transition";
import favicon from "$lib/assets/favicon.svg";
import "../app.css";
import { browser } from "$app/environment";
import { afterNavigate } from "$app/navigation";
import { resolve } from "$app/paths";
import * as auth from "$lib/auth.remote";
import { startPresence } from "$lib/presence";
import { getFriendsUrl, getProfileUrl } from "$lib/user";

const { children, data } = $props();

let sidebarOpen = $state(false);

afterNavigate(() => (sidebarOpen = false));

const sidebarMainItems = $derived(
  [
    { label: "Home", icon: "🏠", href: "/" },
    data.currentUser
      ? {
          label: "Profile",
          icon: "👤",
          href: data.currentUser && getProfileUrl(data.currentUser),
        }
      : { label: "Feed", icon: "📰", href: "/feed" },
    // { label: "Groups", icon: "👥" },
    // { label: "Favorites", icon: "⭐" },
    // { label: "Photos", icon: "📷" },
    // { label: "News feed", icon: "📰" },
    data.currentUser
      ? {
          label: "Friends",
          icon: "🤝",
          href: data.currentUser && getFriendsUrl(data.currentUser),
        }
      : undefined,
    // { label: "Adopt", icon: "🐾" },
    { label: "Pets", icon: "🐕", href: "/pets" },
    { label: "Search People", icon: "🔍", href: "/persons" },
    { label: "Search Associations", icon: "❤️", href: "/associations" },
    // { label: "Pet sitter", icon: "🐕" },
  ].filter((item) => !!item),
);

const sidebarBottomItems = [
  { label: "Help & Support", icon: "❓", href: "/help", requiresLogin: false },
  {
    label: "Settings",
    icon: "⚙️",
    href: resolve("/settings"),
    requiresLogin: true,
  },
];

const newMessages = 0; // TODO new messages

$effect(() => {
  if (browser && data.currentUser) {
    startPresence();
  }
});
</script>

<svelte:head>
  <link class="bg-amber-50" rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Header avec bouton home et messages -->
  <header class="sticky flex-initial top-0 z-10 bg-linear-to-r from-orange-600 to-orange-700 text-white shadow-lg">
    <div class="flex items-center justify-between px-6 py-3">
      <!-- Bouton pour ouvrir la sidebar quand elle est fermée -->
      <button
        onclick={() => sidebarOpen = !sidebarOpen}
        class="bg-linear-to-r from-orange-500 to-orange-700 px-2 py-2 rounded hover:from-orange-100 hover:to-orange-200 transition shadow-lg}"
        style="writing-mode: vertical-rl"
        aria-label="sidebar-open"
      >
        <svg class="w-4 h-4">
          <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path>
        </svg>
      </button>

      <a href={resolve("/")} class="flex items-center gap-3">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🐄%3C/text%3E%3C/svg%3E" alt="Logo" class="w-10 h-10" />
        <div>
          <h1 class="text-3xl font-bold text-yellow-100" style="font-family: Georgia, serif;">Bibi's Farm</h1>
          <p class="text-sm text-yellow-200 italic" style="font-family: Georgia, serif;">Since 1887</p>
        </div>
      </a>

      {#if data.currentUser}
        <a
          href={resolve("/messages")}
          class="relative flex items-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-800 rounded-lg font-semibold transition shadow-md"
        >
          <span class="text-xl">💬</span>
          <span>Messages</span>
          {#if newMessages > 0}
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{newMessages}</span>
          {/if}
        </a>
      {:else}
        <a
          href={resolve("/login")}
          class="relative flex items-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-800 rounded-lg font-semibold transition shadow-md"
        >
          <span class="text-xl">👤</span>
          <span>Login</span>
        </a>
      {/if}
    </div>
  </header>

  <!-- Sidebar -->
  {#if sidebarOpen}
    <aside transition:fly={{x:-50, y:0, delay:0, duration:100}} class="z-30 fixed top-0 bottom-0 overflow-auto w-72 bg-linear-to-b from-orange-50 to-yellow-50 shadow-xl border-r-4 border-orange-600 flex flex-col">
      <div class="p-4 flex-1">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-orange-900">Menu</h2>
          <button
            onclick={() => (sidebarOpen = false)}
            class="text-2xl text-orange-700 hover:text-orange-900 transition"
          >
            &times;
          </button>
        </div>

        <nav class="space-y-2">
          {#each sidebarMainItems as item}
            <a
              href={item.href}
              class="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-orange-100 transition shadow-md border-2 border-orange-300 font-semibold text-orange-900 flex items-center gap-3"
            >
              <span class="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          {/each}
        </nav>
      </div>

      <!-- Bottom section -->
      <div class="p-4 border-t-2 border-orange-300">
        <nav class="space-y-2">
          {#each sidebarBottomItems as item}
            {#if !item.requiresLogin || data.currentUser}
              <a
                href={item.href}
                class="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-orange-100 transition shadow-md border-2 border-orange-300 font-semibold text-orange-900 flex items-center gap-3"
              >
                <span class="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            {/if}
          {/each}
            {#if data.currentUser}
              <button
                onclick={() => auth.logout().then(() => location.reload()).catch((e) => console.log(e))}
                class="cursor-pointer w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-orange-100 transition shadow-md border-2 border-orange-300 font-semibold text-orange-900 flex items-center gap-3"
              >
                <span class="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            {:else}
              <a
                href={resolve("/login")}
                class="cursor-pointer w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-orange-100 transition shadow-md border-2 border-orange-300 font-semibold text-orange-900 flex items-center gap-3"
              >
                <span class="text-xl">👤</span>
                <span>Login</span>
              </a>
            {/if}
        </nav>
      </div>
    </aside>
  {/if}

  <div class="flex-auto flex flex-col *:flex-auto">
    {@render children()}
  </div>
</div>
