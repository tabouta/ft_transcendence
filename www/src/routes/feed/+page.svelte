<script lang="ts">
import PostForm from "$lib/components/PostForm.svelte";
import PostsFeed from "$lib/components/PostsFeed.svelte";

const { data } = $props();

let feed = $state<PostsFeed>();
</script>

<svelte:head>
  <title>Feed - Bibi's Farm</title>
</svelte:head>

<!-- Zone de contenu principal -->
<main class="flex-1 p-6 bg-linear-to-br from-orange-50 via-yellow-50 to-orange-100">
	<div class="max-w-2xl mx-auto">
    <!-- Fil d'actualité -->
		<section class="bg-orange-50 rounded-xl shadow-lg border-3 border-orange-400 p-6 mb-6">
			<h2 class="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
				<span>📰</span>
				News Feed
			</h2>

      <!-- Post input -->
      {#if data.currentUser}
        <PostForm currentUser={data.currentUser} then={() => location.reload()} />
      {/if}

      <!-- Posts -->
			<div class="space-y-4">
        <PostsFeed bind:this={feed} currentUser={data.currentUser} />
      </div>
		</section>
	</div>
</main>
