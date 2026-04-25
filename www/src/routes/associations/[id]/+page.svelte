<script lang="ts">
import { resolve } from "$app/paths";
import { getPetsCount, updateAssociation } from "$lib/associations.remote";
import FileUpload from "$lib/components/FileUpload.svelte";
import PostForm from "$lib/components/PostForm.svelte";
import PostsFeed from "$lib/components/PostsFeed.svelte";
import { formatDate } from "$lib/dateUtils";
import {
  acceptFriend,
  addFriend,
  getFriends,
  removeFriend,
} from "$lib/friends.remote";
import { SPECIES_DEFAULT_ICON, SPECIES_ICONS } from "$lib/pets";
import { getPets } from "$lib/pets.remote";
import { getPosts } from "$lib/posts.remote";
import type { UserPublic } from "$lib/server/db/schema";
import { getUserAvatar } from "$lib/storage";
import { getUser } from "$lib/user.remote";
import type { PageData } from "./$types";

const COVER_IMAGE =
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&h=400&fit=crop";

let { data }: { data: PageData } = $props();

let isEditMode = $state(false);
let fileUpload = $state<FileUpload>();
let removeAvatar = $state(false);
let feed = $state<PostsFeed>();

const association = $derived(
  (await data.association) as UserPublic & { isAssociation: true },
);
const city = $derived(
  (await data.cities).find((city) => city.code === association.city),
);
const pets = $derived(
  getPets({
    owner: association.id,
    search: "",
    sortBy: "name",
  }),
);

const isCurrentUser = $derived(data.currentUser?.id === association.id);

const email = $derived((await getUser(association.id))?.email);
const animalsCount = $derived(await getPetsCount(association.id));

const postsQuery = $derived(getPosts({ author: association.id }));
const posts = $derived(await postsQuery);

const stats = $derived([
  { icon: "🐾", value: animalsCount.toString(), label: "Animals" },
  { icon: "📅", value: formatDate(association.foundedAt), label: "Founded" },
]);

const hasAvatar = $derived(
  (!removeAvatar && association.hasAvatar) || (fileUpload?.hasFile() ?? false),
);
const avatarUrl = $derived.by(() => {
  const file = fileUpload?.getFile();
  if (file && isEditMode) {
    return URL.createObjectURL(file);
  }
  return getUserAvatar({ id: association.id, hasAvatar });
});

$effect(() => {
  if (fileUpload?.hasFile()) {
    removeAvatar = false;
  }
});
</script>

<svelte:head>
  <title>{association.name} - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen relative">
  <!-- Background -->
  <div class="fixed inset-0 -z-10">
    <img 
      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop" 
      alt="Farm" 
      class="w-full h-full object-cover opacity-20"
    />
    <div class="absolute inset-0 bg-linear-to-br from-yellow-50/95 via-orange-50/95 to-amber-100/95"></div>
  </div>

  <!-- Cover Image -->
  <div class="relative h-80 bg-linear-to-r from-orange-700 via-orange-600 to-amber-600">
    <img 
      src={COVER_IMAGE} 
      alt="Cover" 
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/20"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative">
    <!-- Profile Header -->
    <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-4 border-orange-700">
      <form enctype="multipart/form-data" {...updateAssociation.enhance(async ({ submit }) => {
        isEditMode = false;
        await submit();
        await data.association.refresh();
        await postsQuery.refresh();
        // location.reload(); // TODO there might be a better way to reload all images on the page
      })} class="flex flex-col md:flex-row items-center md:items-end gap-6">
        <input {...updateAssociation.fields.id.as("hidden", association.id)} />

        <!-- Profile Picture -->
        <div class="relative">
          <img 
            src={avatarUrl} 
            alt={association.name}
            class="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-white object-cover"
          />
          {#if isEditMode}
            <input
              name="removeAvatar"
              type="hidden"
              bind:value={removeAvatar}
            />
            {#if hasAvatar}
              <button
                type="button"
                onclick={() => {
                  fileUpload?.clearFiles();
                  removeAvatar = true;
                }}
                class={["absolute", "bottom-2", "left-2", "px-1", "border-3", "rounded-2xl", "bg-gray-300", "border-white"]}
              >
                🗑️
              </button>
            {/if}
            <label class="block">
              <FileUpload
                bind:this={fileUpload}
                name="avatar"
                accept="image/*"
              />
              <div class={["absolute", "bottom-2", "right-2", "px-1", "border-3", "rounded-2xl", "bg-gray-300", "border-white"]}>📸</div>
            </label>
          {:else}
            <div class={[association.online ? "bg-green-500" : "bg-gray-300", "absolute", "bottom-2", "right-2", "w-6", "h-6", "rounded-full", "border-4", "border-white"]}></div>
          {/if}
        </div>

        <!-- Association Info -->
        <div class="flex-1 text-center md:text-left">
          {#if isEditMode}
            <label class="block text-gray-700">
              <span class="text-sm font-semibold">Name</span>
              <input
                type="text"
                class="w-full text-xl font-semibold px-4 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-sm"
                {...updateAssociation.fields.name.as("text")}
                value={association.name}
              />
            </label>
          {:else}
            <h1 class="text-3xl font-bold text-gray-900" style="font-family: Georgia, serif;">{association.name}</h1>
          {/if}
          {#if isEditMode}
            <label class="block text-gray-700">
              <span class="text-sm font-semibold">Description</span>
              <textarea
                rows="3"
                class="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-sm resize-none"
                {...updateAssociation.fields.description.as("text")}
              >{association.description}</textarea>
            </label>
          {:else}
            <p class="mt-2 text-gray-700 max-w-2xl">{association.description}</p>
          {/if}

          <div class="flex items-center justify-center md:justify-start gap-6 mt-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {#if isEditMode}
                <select
                  class="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-sm transition"
                  {...updateAssociation.fields.city.as("select")}
                >
                  {#each await data.cities as cityOption}
                  {#if cityOption.code === city?.code}
                    <option selected value={cityOption.code}>{cityOption.name}</option>
                  {:else}
                    <option value={cityOption.code}>{cityOption.name}</option>
                  {/if}
                  {/each}
                </select>
              {:else}
                <span>{city?.name}</span>
              {/if}
            </div>
            <div class="flex items-center gap-1">
              <span>📞</span>
              {#if isEditMode}
                <div class="flex">
                  <textarea
                    class="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none shadow-sm transition resize-none"
                    rows=1
                    {...updateAssociation.fields.phone.as("text")}
                  >{association.phone}</textarea>
                </div>
              {:else}
                <span>{association.phone}</span>
              {/if}
            </div>
            <div class="flex items-center gap-1">
              <span>📧</span>
              <span>{email}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          {#if isCurrentUser}
            {#if isEditMode}
              <button type="submit" class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Save profile
              </button>
            {:else}
              <button type="button" onclick={() => isEditMode = true} class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Edit profile
              </button>
            {/if}
          {:else if data.currentUser}
            {@const friend = (await getFriends()).find((friend) => association.id === friend.id)}
            {#if friend}
              {#if friend.status == "received"}
                <button onclick={() => acceptFriend(association.id)} class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Accept invitation
                </button>
              {:else if friend.status}
                <button onclick={() => removeFriend(association.id)} class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {#if friend.status == "sent"}
                    Invitation sent
                  {:else}
                    Followed
                  {/if}
                </button>
              {/if}
            {:else}
              <button onclick={() => addFriend(association.id)} class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Follow
              </button>
            {/if}
            <a href={resolve(`/messages/${association.id}`)} class="px-6 py-3 bg-yellow-50 border-2 border-orange-700 text-amber-900 rounded-lg font-medium hover:bg-yellow-100 transition-all duration-200 shadow-md hover:shadow-lg">
              💬 Message
            </a>
          {/if}
        </div>
      </form>

      <!-- Stats -->
      <div class="flex justify-center md:justify-start gap-8 mt-6 pt-6 border-t-2 border-orange-700">
        {#each stats as stat}
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-700">{stat.value}</div>
            <div class="text-sm text-amber-900 flex items-center gap-1">
              <span>{stat.icon}</span>
              <span>{stat.label}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-8">
      <!-- Left Sidebar - About -->
      <div class="lg:col-span-1 space-y-6">
        <!-- About Card -->
        <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 border-orange-700">
          <h2 class="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span class="text-2xl">ℹ️</span>
            About
          </h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-3">
              <span class="text-xl">🏛️</span>
              <div>
                <div class="font-semibold text-gray-700">Type</div>
                <div class="text-gray-600">{association.type}</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-xl">📅</span>
              <div>
                <div class="font-semibold text-gray-700">Founded</div>
                <div class="text-gray-600">{formatDate(association.foundedAt)}</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-xl">🐾</span>
              <div>
                <div class="font-semibold text-gray-700">Animals</div>
                <div class="text-gray-600">{animalsCount} animals currently in care</div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 border-orange-700">
          <h2 class="text-xl font-bold text-amber-900 mb-4 flex items-center justify-between">
            <span class="flex items-center gap-2">
              <span class="text-2xl">🐾</span>
              Animals
            </span>
            {#if isCurrentUser}
              <div class="flex gap-2">
                <a href={resolve("/new-pet")} aria-label="Add new animal" class="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 font-medium transition-colors">
                  +
                </a>
              </div>
            {:else}
              <span class="text-sm text-orange-700 font-medium">{(await pets).length} animals</span>
            {/if}
          </h2>
          <div class="grid grid-cols-2 gap-3">
            {#each await pets as pet (pet.id)}
              <a href={resolve(`/pets/${pet.id}`)} class="p-3 bg-yellow-100 rounded-lg border-2 border-orange-700 hover:bg-orange-100 transition-all duration-200">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-2xl">{SPECIES_ICONS.get(pet.species) ?? SPECIES_DEFAULT_ICON}</span>
                  <span class="font-bold text-gray-900">{pet.name}</span>
                </div>
                <div class="text-xs text-gray-600">{pet.species} • {pet.breed}</div>
              </a>
            {/each}
            {#if (await pets).length == 0}
              <div class="col-span-2 text-center py-4 text-gray-600">
                {#if isCurrentUser}
                  No animals yet. Add your first one!
                {:else}
                  No animals registered
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="lg:col-span-2 space-y-6">
        {#if isCurrentUser && data.currentUser}
          <PostForm currentUser={data.currentUser} then={() => location.reload()} />
        {/if}

        <PostsFeed bind:this={feed} queryArgs={{ author: association.id }} currentUser={data.currentUser} />

        {#if posts.length === 0}
          <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg p-12 border-4 border-orange-700 text-center">
            <div class="text-6xl mb-4">📝</div>
            <h3 class="text-2xl font-bold text-orange-900 mb-2">No posts yet</h3>
            <p class="text-gray-700">This association hasn't shared anything yet.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
