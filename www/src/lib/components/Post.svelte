<script lang="ts">
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import Comment from "$lib/components/Comment.svelte";
import { formatRelativeTime } from "$lib/dateUtils";
import { SPECIES_DEFAULT_ICON, SPECIES_ICONS } from "$lib/pets";
import { getPet } from "$lib/pets.remote";
import {
  createComment,
  deletePost,
  editPost,
  getPostCommentCount,
  getPostComments,
  getPostFileType,
  getPostLikes,
  isPostLiked,
  likePost,
  unlikePost,
} from "$lib/posts.remote";
import type { Post, UserPublic } from "$lib/server/db/schema";
import { getPetAvatar, getPostImage, getUserAvatar } from "$lib/storage";
import { TEXT_LIMITS } from "$lib/textLimits";
import { getFullName, getProfileUrl } from "$lib/user";
import { getUser } from "$lib/user.remote";

interface Props {
  post: Post;
  author: UserPublic;
  currentUser?: UserPublic;
  isFullPage?: boolean;
  onDelete?: () => void | Promise<void>;
}

const {
  post: post,
  author,
  currentUser,
  isFullPage = false,
  onDelete: onDeleteCallback,
}: Props = $props();

const pet = $derived(post.pet ? await getPet(post.pet) : undefined);
const comments = $derived(getPostComments(post.id));

let optionsOpen = $state(false);
let commentsOpen = $state((() => isFullPage)());

let isEditing = $state(false);
let copied = $state(false);

let isImageError = $state(false);

const isOwned = $derived(currentUser?.id === author.id);
const isLiked = $derived(isPostLiked(post.id));

const onLikePost = async () => {
  try {
    if (await isLiked) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
  } catch {
    await goto(resolve("/login"));
  }
};

const onDelete = async () => {
  optionsOpen = false;
  await deletePost(post.id);
  if (onDeleteCallback) {
    await onDeleteCallback();
  }
};

const onShare = async () => {
  const postUrl = `${window.location.origin}/post/${post.id}`;
  await navigator.clipboard.writeText(postUrl);
  copied = true;
  setTimeout(() => {
    copied = false;
  }, 2000);
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

<div class="relative h-fit bg-linear-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border-4 border-orange-700 hover:shadow-xl transition-all duration-200">
  <!-- Post Header -->
  <div class="p-4 flex items-center gap-3">
    <div class="relative">
      <a href={resolve(getProfileUrl(author))}>
        <img 
          src={getUserAvatar(author)}
          alt={getFullName(author)}
          class="w-12 h-12 rounded-full border-2 border-orange-700 object-cover"
        />
      </a>
      {#if author.online}
        <div class="bg-green-500 absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"></div>
      {/if}
      {#if pet}
        <a href={resolve(`/pets/${pet.id}`)}>
          {#if pet && pet.hasAvatar} <!-- keep `pet &&`, seems to fix a Svelte bug -->
            <img
              alt="Pet"
              src={getPetAvatar(pet)}
              class="absolute -bottom-2 -left-2 w-8 h-8 rounded-full border-2 border-orange-200 bg-white object-cover"
            />
          {:else}
            <p
              class="text-center absolute -bottom-2 -left-2 w-8 h-8 rounded-full border-2 border-orange-200 bg-white"
            >
              {SPECIES_ICONS.get(pet.species) ?? SPECIES_DEFAULT_ICON}
            </p>
          {/if}
        </a>
      {/if}
    </div>
    <div class="flex-1">
      <a href={resolve(getProfileUrl(author))}>
        <p class="font-semibold text-gray-900">{getFullName(author)}</p>
      </a>
      <p class="text-sm text-gray-600">{formatRelativeTime(post.postedAt)}</p>
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

  <!-- Post Image -->
  {#if post.hasFile}
    {#if (await getPostFileType(post.id))?.startsWith("video/")}
      <video controls loop autoplay>
        <source src={getPostImage(post)} />
      </video>
    {:else}
      <a href={resolve(`/post/${post.id}`)}>
        <img 
          src={getPostImage(post)}
          alt="Post"
          class="{isImageError ? "hidden" : ""} w-full aspect-video object-cover"
          onerror={() => isImageError = true}
        />
      </a>
    {/if}
  {:else}
    <div class="p-4">
      {@render caption()}
    </div>
  {/if}

  <!-- Post Actions -->
  <div class="p-4 space-y-3">
    <div class="flex items-center gap-4">
      <button onclick={onLikePost} class="flex items-center gap-2 text-amber-900 hover:text-orange-700 transition-colors group">
        <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill={await isLiked ? "red" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <span class="font-medium">{await getPostLikes(post.id)}</span>
      </button>
      <button onclick={() => !isFullPage && (commentsOpen = !commentsOpen)} class={[isFullPage ? "" : "hover:text-orange-700", "flex", "items-center", "gap-2", "text-amber-900", "transition-colors", "group"]}>
        <svg class={[isFullPage ? "" : "group-hover:scale-110", "w-6", "h-6", "transition-transform"]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="font-medium">{await getPostCommentCount(post.id)}</span>
      </button>
      <button onclick={() => onShare()} class="flex items-center gap-2 text-amber-900 hover:text-orange-700 transition-colors group ml-auto relative" aria-label="Share">
        <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        {#if copied}
          <span class="absolute left-0 -translate-x-full bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg whitespace-nowrap animate-bounce">
            ✓ Copied!
          </span>
        {/if}
      </button>
    </div>

    <!-- Caption -->
    {#if post.hasFile}
      {@render caption()}
    {/if}

    <!-- Comments -->
    {#if commentsOpen}
      <div class="flex flex-col content-center">
        {#each await comments as comment}
          {@const author = await getUser(comment.author)}
          {#if author}
            <Comment comment={comment} author={author} currentUser={currentUser} />
          {/if}
        {/each}
        <form class="m-1 p-4 bg-orange-50 rounded-lg border-2 border-orange-300 shadow" {...createComment}>
          <input {...createComment.fields.post.as("hidden", post.id)}/>
          <textarea 
            class="w-full p-3 rounded-lg border-2 border-orange-300 focus:border-orange-500 focus:outline-none resize-none bg-white"
            placeholder="What's new?"
            rows="3"
            required
            maxlength={TEXT_LIMITS.COMMENT_CONTENT}
            {...createComment.fields.content.as("text")}
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              type="submit"
              class="px-6 py-2 bg-linear-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition shadow-md"
            >
              Comment
            </button>
          </div>
        </form>
      </div>
    {/if}
  </div>
</div>

{#snippet caption()}
  {#if isEditing}
    <form {...editPost.enhance(async ({submit}) => {
      await submit();
      closeEdit();
      location.reload();
    })}>
      <input {...editPost.fields.id.as("hidden", post.id)}/>
      <textarea class="w-full p-3 rounded-lg border-2 border-orange-300 focus:border-orange-500 focus:outline-none resize-none bg-white" {...editPost.fields.content.as("text")}
      >{post.content}</textarea>
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
    <p class="text-gray-800 wrap-break-word">{post.content}</p>
  {/if}
{/snippet}
