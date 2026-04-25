<script lang="ts">
import type { RemoteQuery } from "@sveltejs/kit";
import FileUpload from "$lib/components/FileUpload.svelte";
import FileUploadPreview from "$lib/components/FileUploadPreview.svelte";
import { getPets } from "$lib/pets.remote";
import { createPost } from "$lib/posts.remote";
import { type Pet, type UserPublic } from "$lib/server/db/schema";
import { TEXT_LIMITS } from "$lib/textLimits";
import RemoteForm from "./RemoteForm.svelte";

interface Props {
  currentUser: UserPublic;
  forcePet?: Pet;
  updates?: Array<RemoteQuery<any>>;
  then?: () => void | Promise<void>;
}

const { currentUser, forcePet, updates = [], then }: Props = $props();

let preview = $state<FileUploadPreview>();
let fileUpload = $state<FileUpload>();

const pets = $derived(
  await getPets({ owner: currentUser.id, search: "", sortBy: "species" }),
);
</script>

<RemoteForm
  class="flex flex-col mb-6 p-4 bg-orange-50 rounded-2xl border-4 border-orange-300 shadow-lg"
  function={createPost}
  updates={updates}
  then={then}
  onloadstart={preview?.uploadStart}
  onloadend={preview?.uploadDone}
  onprogress={preview?.setProgress}
>
  <FileUploadPreview bind:this={preview} fileUpload={fileUpload} class="mb-1" />
  <textarea
    class="w-full p-3 rounded-lg border-2 border-orange-300 focus:border-orange-500 focus:outline-none resize-none bg-white"
    placeholder="What's new?"
    rows="3"
    maxlength={TEXT_LIMITS.POST_CONTENT}
    {...createPost.fields.content.as("text")}
    required
  ></textarea>
  <div class="flex justify-end space-x-4 mt-2">
    <label
      class="px-4 py-1 bg-orange-700 text-white rounded-lg font-bold text-center divide-x-2 divide-gray-100"
    >
      <span class="pr-2">Pet</span>
      {#if forcePet}
        <input
          class="pl-1 py-1 rounded-lg hover:bg-orange-800 transition-all cursor-pointer"
          {...createPost.fields.pet.as("hidden", forcePet.id)}
        />
        {forcePet.name}
      {:else}
        <select
          class="pl-1 py-1 rounded-lg hover:bg-orange-800 transition-all cursor-pointer"
          {...createPost.fields.pet.as("select")}
        >
          <option value={undefined}></option>
          {#each pets as pet}
            <option value={pet.id}>{pet.name}</option>
          {/each}
        </select>
      {/if}
    </label>
    <label>
      <FileUpload
        bind:this={fileUpload}
        name="file"
        accept="image/*,video/*"
      />
      <div class="px-4 py-2 bg-orange-700 text-white rounded-lg font-bold text-center hover:bg-orange-800 transition-all cursor-pointer">
        📷 Upload
      </div>
    </label>
    <button type="submit" class="px-6 py-2 bg-linear-to-r from-orange-600 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition shadow-md">
      Post
    </button>
  </div>
</RemoteForm>
