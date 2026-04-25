<script lang="ts">
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import AssociationCard from "$lib/components/AssociationCard.svelte";
import FileUpload from "$lib/components/FileUpload.svelte";
import PostForm from "$lib/components/PostForm.svelte";
import PostsFeed from "$lib/components/PostsFeed.svelte";
import UserCard from "$lib/components/UserCard.svelte";
import { deletePet, updatePet } from "$lib/pets.remote";
import { getPosts } from "$lib/posts.remote";
import { getPetAvatar } from "$lib/storage";
import { getProfileUrl } from "$lib/user";

const COVER_IMAGE =
  "https://lafermeducoudray.com/wp-content/uploads/2024/03/La-ferme-du-Coudray-Arnaud-Delaunay-2.jpg";

const { data } = $props();

let isEditMode = $state(false);
let fileUpload = $state<FileUpload>();
let removeAvatar = $state(false);
let feed = $state<PostsFeed>();

// TODO remove fake data
const pet = $derived(await data.pet);
const owner = $derived(await data.owner);
const city = $derived(await data.city);
const postsQuery = $derived(getPosts({ pet: pet.id }));
const posts = $derived(await postsQuery);

const isOwned = $derived(data.currentUser?.id === pet.ownerId);

const hasAvatar = $derived(
  (!removeAvatar && pet.hasAvatar) || (fileUpload?.hasFile() ?? false),
);
const avatarUrl = $derived.by(() => {
  const file = fileUpload?.getFile();
  if (file && isEditMode) {
    return URL.createObjectURL(file);
  }
  return getPetAvatar({ id: pet.id, hasAvatar });
});

$effect(() => {
  if (fileUpload?.hasFile()) {
    removeAvatar = false;
  }
});
</script>

<svelte:head>
  <title>{pet.name}'s Profile</title>
</svelte:head>

<div class="min-h-screen relative bg-linear-to-br from-yellow-50/95 via-orange-50/95 to-amber-100/95">
  <!-- Cover Image -->
  <div class="relative h-80 bg-linear-to-r from-orange-700 via-orange-600 to-amber-600">
    <img
      src={COVER_IMAGE}
      alt="Couverture"
       class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/20"></div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative">
    <!-- Profile Header -->
    <div class="bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-4 border-orange-700">
      <form enctype="multipart/form-data" {...updatePet.enhance(async ({ submit }) => {
        await submit();
        await data.pet.refresh();
        await postsQuery.refresh();
        isEditMode = false;
        // location.reload(); // TODO there might be a better way to reload all images on the page
      })} class="flex flex-col md:flex-row items-center md:items-end gap-6">
        <input {...updatePet.fields.id.as("hidden", pet.id)} />

        <!-- Profile Picture -->
        <div class="relative">
          <img 
            src={avatarUrl} 
            alt={pet.name}
            class="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-white"
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
          {/if}
        </div>

        <!-- User Info -->
        <div class="flex-1 text-center md:text-left">
          {#if isEditMode}
            <div class="flex flex-col space-y-2 max-w-xl">
              <!-- Name -->
              <label class="block text-gray-700">
                <span class="text-sm font-semibold">Name</span>
                <input
                  type="text"
                  class="w-full text-xl font-semibold px-4 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-sm"
                  {...updatePet.fields.name.as("text")}
                  value={pet.name}
                />
              </label>

              <!-- Description -->
              <label class="block text-gray-700">
                <span class="text-sm font-semibold">Description</span>
                <textarea
                  rows="3"
                  class="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition shadow-sm resize-none"
                  {...updatePet.fields.description.as("text")}
                >{pet.description}</textarea>
              </label>
            </div>
          {:else}
            <h1 class="text-3xl font-bold text-gray-900">{pet.name}</h1>
            <p class="mt-2 text-gray-700 max-w-2xl">{pet.description}</p>
          {/if}
          <div class="flex items-center justify-center md:justify-start gap-6 mt-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>{city.name}</span>
            </div>
              <div class="flex items-center gap-1">
                🎂 {Math.floor((new Date().getTime() - pet.birth.getTime()) / 1000 / 3600 / 24 / 365)}
              </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          {#if isOwned}
            {#if isEditMode}
              <button type="submit" class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Save profile
              </button>
            {:else}
              <button type="button" onclick={async () => { await deletePet(pet.id); data.currentUser && await goto(resolve(getProfileUrl(data.currentUser))); }} class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Delete
              </button>
              <button type="button" onclick={() => isEditMode = true} class="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Edit profile
              </button>
            {/if}
          {/if}
        </div>
      </form>

      <!-- Stats -->
      <div class="flex justify-center md:justify-start gap-8 mt-6 pt-6 border-t-2 border-orange-700">
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-700">{posts.length}</div>
          <div class="text-sm text-amber-900">Posts</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-8">
      <!-- Left Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        {#if owner.isAssociation}
          <AssociationCard association={owner} currentUser={data.currentUser}/>
        {:else}
          <UserCard user={owner} currentUser={data.currentUser}/>
        {/if}
      </div>

      <!-- Right Content - Feed -->
      <div class="lg:col-span-2 space-y-6">
        {#if isOwned && data.currentUser}
          <PostForm currentUser={data.currentUser} forcePet={pet} then={() => location.reload()} />
        {/if}

        {#if posts.length == 0}
          <div class="text-center py-12">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-2xl font-bold text-[#8B4513] mb-2">Nothing to see here</h3>
            {#if isOwned}
              <p class="text-[#A0522D]">Create their first post !</p>
            {/if}
          </div>
        {/if}

        <PostsFeed bind:this={feed} queryArgs={{ pet: pet.id }} currentUser={data.currentUser} />
      </div>
    </div>
  </div>
</div>
