<script lang="ts">
import { resolve } from "$app/paths";
import { getPetsCount } from "$lib/associations.remote";
import { getCity } from "$lib/city.remote";
import { formatDate } from "$lib/dateUtils";
import type { UserPublic } from "$lib/server/db/schema";
import { getUserAvatar } from "$lib/storage";

const {
  association,
  currentUser,
}: {
  association: UserPublic & { isAssociation: true };
  currentUser?: UserPublic;
} = $props();

const city = $derived(await getCity(association.city));
</script>

<div
  class="bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-orange-400 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
>
  <!-- Logo and type badge -->
  <div class="relative bg-linear-to-br from-orange-200 to-yellow-200 p-6">
    <div class="flex justify-center">
      <div class="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-6xl">
        <img 
          src={getUserAvatar(association)} 
          alt={association.name}
          class="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white object-cover"
        />
        {#if association.online}
          <div class={["bg-green-500", "absolute", "bottom-2", "right-2", "w-6", "h-6", "rounded-full", "border-4", "border-white"]}></div>
        {/if}
      </div>
    </div>

    <!-- Type badge -->
    <span class="absolute top-3 right-3 px-3 py-1 bg-orange-600 text-white rounded-lg font-bold text-sm shadow-md">
      {association.type}
    </span>
  </div>

  <!-- Info -->
  <div class="p-5">
    <h3 class="text-xl font-bold text-orange-900 mb-2" style="font-family: Georgia, serif;">
      {association.name}
    </h3>

    <div class="flex items-center gap-4 mb-3 text-sm text-orange-800">
      <div class="flex items-center gap-1">
        <span>📍</span>
        <span>{city?.name}</span>
      </div>
      <div class="flex items-center gap-1">
        <span>📅</span>
        <span>Since {formatDate(association.foundedAt)}</span>
      </div>
    </div>

    <div class="mb-3 text-sm text-orange-800 flex items-center gap-1">
      <span>🐾</span>
      <span class="font-semibold">{await getPetsCount(association.id)} animals</span>
    </div>

    <p class="text-sm text-gray-700 mb-4 line-clamp-3 italic">
      "{association.description}"
    </p>

    <!-- Contact info -->
    <div class="mb-4 space-y-1 text-xs text-gray-600">
      <div class="flex items-center gap-2">
        <span>📧</span>
        <span class="truncate">{association.email}</span>
      </div>
      <div class="flex items-center gap-2">
        <span>📞</span>
        <span>{association.phone}</span>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex gap-2">
      <a href={resolve(`/associations/${association.id}`)} class="text-center flex-1 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-colors shadow-md">
        👁️ View profile
      </a>
      {#if currentUser?.id !== association.id}
        <a href={resolve(`/messages/${association.id}`)} class="text-center flex-1 py-2 bg-white border-2 border-orange-400 text-orange-900 rounded-lg font-bold hover:bg-orange-50 transition-colors">
          💬 Contact
        </a>
      {/if}
    </div>
  </div>
</div>
