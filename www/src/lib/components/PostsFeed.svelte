<script lang="ts">
import Post from "$lib/components/Post.svelte";
import { getPosts } from "$lib/posts.remote";
import { type UserPublic } from "$lib/server/db/schema";
import { getUser } from "$lib/user.remote";

const PAGE_SIZE = 10;

const {
  queryArgs = {},
  currentUser,
}: {
  queryArgs?: {
    author?: string;
    pet?: string;
  };
  currentUser?: UserPublic;
} = $props();

let offset = $state(0);
let loader = $state<HTMLDivElement>();
let isLoaderVisible = $state(false);
let isLoadingMore = $state(false);
let nothingToLoad = $state(false);

let posts = $derived(
  await getPosts({ offset: 0, limit: PAGE_SIZE, ...queryArgs }),
);

async function onLoaderVisibilityChange(isVisible: boolean) {
  if (isVisible) {
    if (!isLoaderVisible) {
      await wait();
      isLoaderVisible = true;
      isLoadingMore = true;
      offset += PAGE_SIZE;
      const newPosts = await getPosts({
        offset,
        limit: PAGE_SIZE,
        ...queryArgs,
      });
      if (isLoadingMore) {
        nothingToLoad = newPosts.length === 0;
        posts = posts.concat(newPosts);
        setTimeout(() => (isLoadingMore = false), 1000);
      }
    }
  } else {
    isLoaderVisible = false;
  }
}

async function wait() {
  if (!isLoadingMore) {
    return;
  }
  await new Promise((r) => setTimeout(r, 100));
  return await wait();
}

$effect(() => {
  const observer = new IntersectionObserver((entries, _) => {
    const entry = entries.find((entry) => entry.target === loader);
    if (!entry) {
      return;
    }
    onLoaderVisibilityChange(entry.isIntersecting);
  });
  if (loader) {
    observer.observe(loader);
  }
  return () => observer.disconnect();
});
</script>

{#each posts as post}
  {@const author = await getUser(post.author)}
  {#if author}
    <Post post={post} author={author} currentUser={currentUser} onDelete={() => location.reload()} />
  {/if}
{/each}

{#if !nothingToLoad}
  <div class="flex justify-center items-center py-8">
    <div class="flex flex-col items-center gap-3">
      <div class="w-12 h-12 border-4 border-orange-400 border-t-orange-600 rounded-full animate-spin"></div>
      <p class="text-orange-700 font-medium">Loading more posts...</p>
    </div>
  </div>
{/if}

<div bind:this={loader}></div>
