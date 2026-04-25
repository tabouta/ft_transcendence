<script lang="ts">
import { resolve } from "$app/paths";
import { getUserFriends } from "$lib/friends.remote";
import type { UserPublic } from "$lib/server/db/schema";
import { getUserAvatar } from "$lib/storage";
import { getFullName, getProfileUrl } from "$lib/user";

const { data } = $props();

const friends = $derived(
  (await getUserFriends(data.user.id)).map(({ status, ...friend }) => ({
    status,
    ...(friend as UserPublic),
  })),
);

const isCurrentUser = $derived(data.currentUser?.id === data.user?.id);
</script>

<svelte:head>
  <title>Friends - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen relative">
  <!-- Background Image de ferme -->
  <div class="fixed inset-0">
    <img 
      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop" 
      alt="Ferme" 
      class="w-full h-full object-cover opacity-20"
    />
    <div class="absolute inset-0 bg-linear-to-br from-yellow-50/95 via-orange-50/95 to-amber-100/95"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
    <!-- Header -->
    <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-4 border-orange-700 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span class="text-4xl">👥</span>
            {#if isCurrentUser}
              My Friends
            {:else}
              {data.user?.firstName} {data.user?.lastName}'s Friends
            {/if}
          </h1>
          <p class="text-gray-600 mt-2">
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </p>
        </div>
        <a 
          href={resolve(`/persons/${data.user?.id}`)} 
          class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          ← Back to profile
        </a>
      </div>
    </div>

    <!-- Friends Grid -->
    {#if friends.length === 0}
      <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg p-12 border-4 border-orange-700 text-center">
        <div class="text-6xl mb-4">🐄</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No friends yet</h2>
        <p class="text-gray-600">
          {#if isCurrentUser}
            Start connecting with other farmers and animal lovers!
          {:else}
            This user hasn't added any friends yet.
          {/if}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each friends.filter((friend) => friend.status === "friends") as friend (friend.id)}
          <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg border-4 border-orange-700 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <a href={resolve(getProfileUrl(friend))} class="block">
              <!-- Friend Avatar -->
              <div class="relative h-48 bg-linear-to-br from-orange-400 to-orange-600">
                <img 
                  src={getUserAvatar(friend)}
                  alt="{getFullName(friend)}"
                  class="w-full h-full object-cover"
                />
                {#if friend.online}
                  <div class="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Online
                  </div>
                {/if}
              </div>

              <!-- Friend Info -->
              <div class="p-5">
                <h3 class="tdescription-xl font-bold text-gray-900 mb-1">
                  {getFullName(friend)}
                </h3>description

                {#if friend.description.length > 0}
                  <p class="text-sm text-gray-700 line-clamp-2 mb-4">
                    {friend.description}
                  </p>
                {/if}

                <!-- Action Buttons -->
                <div class="flex gap-2 mt-4">
                  <button class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md text-sm">
                    View Profile
                  </button>
                  <button class="px-4 py-2 bg-yellow-50 border-2 border-orange-700 text-amber-900 rounded-lg font-medium hover:bg-yellow-100 transition-all duration-200 shadow-md">
                    💬
                  </button>
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
