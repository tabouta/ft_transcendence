<script lang="ts">
import { slide } from "svelte/transition";
import { resolve } from "$app/paths";
import { formatRelativeTime } from "$lib/dateUtils";
import { deleteComment, editComment } from "$lib/posts.remote";
import type { PostComment, UserPublic } from "$lib/server/db/schema";
import { getUserAvatar } from "$lib/storage";
import { TEXT_LIMITS } from "$lib/textLimits";
import { getFullName, getProfileUrl } from "$lib/user";

interface Props {
  comment: PostComment;
  author: UserPublic;
  currentUser?: UserPublic;
}

const { comment, author, currentUser }: Props = $props();

let optionsOpen = $state(false);

let isEditing = $state(false);

const isOwned = $derived(currentUser?.id === author.id);

const onDelete = async () => {
  optionsOpen = false;
  await deleteComment(comment.id);
};

const onEditStart = () => {
  optionsOpen = false;
  isEditing = !isEditing;
};

const closeEdit = () => {
  optionsOpen = false;
  isEditing = false;
};
</script>

<div transition:slide class="relative m-1 p-4 bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-300 shadow">
  <div class="flex items-center gap-3 mb-3">
    <a href={resolve(getProfileUrl(author))}>
      <div class="relative">
        <img 
          src={getUserAvatar(author)}
          alt={getFullName(author)}
          class="w-12 h-12 rounded-full border-2 border-orange-700 object-cover"
        />
        {#if author.online}
          <div class={["bg-green-500", "absolute", "bottom-0", "right-0", "w-3", "h-3", "rounded-full", "border-2", "border-white"]}></div>
        {/if}
      </div>
    </a>
    <div class="flex-1">
      <a href={resolve(getProfileUrl(author))}>
        <div class="font-semibold text-orange-900">{getFullName(author)}</div>
      </a>
      <div class="text-xs text-gray-600">{formatRelativeTime(comment.postedAt)}</div>
    </div>
    {#if isOwned}
      <button onclick={() => optionsOpen = !optionsOpen} class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Actions">
        <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </button>
    {/if}
  </div>

  {#if optionsOpen}
    <div class="absolute top-14 right-6 flex flex-col p-2 bg-orange-50 rounded-lg shadow-2xl border-4 border-orange-600 z-20">
      <button onclick={onEditStart}>Edit</button>
      <button onclick={onDelete}>Delete</button>
    </div>
  {/if}

  {#if isEditing}
    <form {...editComment} onsubmit={closeEdit}>
      <input {...editComment.fields.id.as("hidden", comment.id)}/>
      <textarea 
        class="w-full p-3 rounded-lg border-2 border-orange-300 focus:border-orange-500 focus:outline-none resize-none bg-white" 
        maxlength={TEXT_LIMITS.COMMENT_CONTENT}
        {...editComment.fields.content.as("text")}
      >{comment.content}</textarea>
      <div class="flex mt-1">
        <div class="flex-1"></div>
        <button onclick={closeEdit} class="px-6 py-2 mr-1 bg-linear-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition shadow-md">
          Cancel
        </button>
        <button type="submit" class="px-6 py-2 bg-linear-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition shadow-md">
          Post
        </button>
      </div>
    </form>
  {:else}
    <p class="text-gray-800 mb-3">{comment.content}</p>
  {/if}
</div>
