<script lang="ts">
import { resolve } from "$app/paths";
import { formatRelativeTime } from "$lib/dateUtils";
import { getUserAvatar } from "$lib/storage";
import { getFullName } from "$lib/user";
import { getUser } from "$lib/user.remote";

const { data } = $props();

const chats = $derived(data.chats);
</script>

<svelte:head>
  <title>Messages - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen bg-[#f5e6d3]">
  <!-- Header -->
  <div class="bg-linear-to-r from-[#CC5500] to-[#A04000] py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl md:text-5xl font-bold text-white text-center mb-4">
        💬 Messages
      </h1>
      <p class="text-xl text-white/90 text-center max-w-2xl mx-auto">
        Stay in touch with the Bibi's Farm community
      </p>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Messages list -->
    <div class="bg-[#fef7ed] rounded-2xl shadow-xl border-4 border-[#8B4513]">
      <div class="p-6 border-b-2 border-[#8B4513]">
        <h2 class="text-2xl font-bold text-[#8B4513] flex items-center gap-2">
          <span>📨</span>
          Your Conversations
        </h2>
      </div>

      <div class="divide-y-2 divide-[#8B4513]">
        {#each chats as chat}
          {@const friend = await getUser(data.currentUser.id === chat.left ? chat.right : chat.left)}
          {#if friend && chat.lastMessage}
            {@const isOnline = friend.online ?? false}
            <a 
              href={resolve(`/messages/${friend.id}`)}
              class="flex items-center gap-4 p-6 hover:bg-[#f5e6d3] transition-colors group"
            >
              <!-- Avatar -->
              <div class="relative shrink-0">
                <img 
                  src={getUserAvatar(friend)} 
                  alt={getFullName(friend)}
                  class="w-16 h-16 rounded-full border-3 border-[#8B4513] bg-white object-cover"
                />
                {#if isOnline}
                  <div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                {/if}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-lg font-bold text-[#8B4513] group-hover:text-[#CC5500] transition-colors">
                    {getFullName(friend)}
                  </h3>
                  {#if chat.lastMessage}
                    <span class="text-sm text-[#A0522D] font-medium">{formatRelativeTime(chat.lastMessage.sentAt)}</span>
                  {/if}
                </div>
                {#if chat.lastMessage}
                  <p class="text-[#8B4513] truncate">
                    {#if chat.new}
                      <span class="inline-block w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></span>
                    {/if}
                    {chat.lastMessage.author.isAssociation ? chat.lastMessage.author.name : chat.lastMessage.author.firstName}: {chat.lastMessage.content}
                  </p>
                {/if}
              </div>

              <!-- Arrow -->
              <svg class="w-6 h-6 text-[#8B4513] group-hover:text-[#CC5500] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          {/if}
        {/each}
      </div>

      <!-- Empty state -->
      {#if chats.length === 0}
        <div class="p-12 text-center">
          <div class="text-6xl mb-4">💭</div>
          <h3 class="text-2xl font-bold text-[#8B4513] mb-2">No conversations yet</h3>
          <p class="text-[#A0522D] mb-6">Start chatting with members of the community!</p>
          <a 
            href={resolve("/persons")}
            class="inline-block px-6 py-3 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-lg font-bold hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg"
          >
            Find people
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>
