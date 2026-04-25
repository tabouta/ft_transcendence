<script lang="ts">
import { resolve } from "$app/paths";
import { getCity } from "$lib/city.remote";
import { formatDate } from "$lib/dateUtils";
import type { UserPublic } from "$lib/server/db/schema";
import { getUserAvatar } from "$lib/storage";
import { getProfileUrl } from "$lib/user";

interface Props {
  user: UserPublic & { isAssociation: false };
  currentUser?: UserPublic;
}

const { user, currentUser }: Props = $props();

const city = $derived(await getCity(user.city));
</script>

<div
  class="bg-white rounded-2xl shadow-lg overflow-hidden border-3 border-orange-400"
>
  <!-- Profile picture -->
  <div class="relative bg-linear-to-br from-orange-200 to-yellow-200 p-6">
    <div class="flex justify-center">
      <div class="relative">
        <img 
          src={getUserAvatar(user)} 
          alt={user.firstName + ' ' + user.lastName}
          class="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white object-cover"
        />
        {#if user.online}
          <div class={["bg-green-500", "absolute", "bottom-2", "right-2", "w-6", "h-6", "rounded-full", "border-4", "border-white"]}></div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Info -->
  <div class="p-5">
    <h3 class="text-2xl font-bold text-orange-900 mb-1" style="font-family: Georgia, serif;">
      {user.firstName} {user.lastName}
    </h3>
    <div class="flex items-center gap-4 mb-3 text-sm text-orange-800">
      <div class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>{city?.name}</span>
      </div>
      <div class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span>{formatDate(user.joinedAt)}</span>
      </div>
    </div>

    <p class="text-sm text-gray-700 mb-4 line-clamp-2 italic h-10">
      "{user.description}"
    </p>

    <!-- Buttons -->
    <div class="flex gap-2">
      <a href={getProfileUrl(user)} class="text-center flex-1 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-colors shadow-md">
        👁️ View profile
      </a>
      {#if currentUser?.id !== user.id}
        <a href={resolve(`/messages/${user.id}`)} class="flex-1 py-2 bg-white border-2 border-orange-400 text-orange-900 rounded-lg font-bold hover:bg-orange-50 transition-colors text-center">
          💬 Message
        </a>
      {/if}
    </div>
  </div>
</div>
