<script lang="ts">
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import Post from "$lib/components/Post.svelte";

const { data } = $props();
</script>

<svelte:head>
  <title>Post - Bibi's Farm</title>
</svelte:head>

<div class="flex w-full p-12 items-center justify-center bg-linear-to-br from-orange-50 via-yellow-50 to-orange-100">
  <Post post={data.post} author={data.author} currentUser={data.currentUser} isFullPage={true} onDelete={async () => await goto(resolve("/feed"))} />
</div>
