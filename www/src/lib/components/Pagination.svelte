<script lang="ts">
interface Props {
  pageSize: number;
  itemsCount: number;
  currentPage: number;
  setPage: (page: number) => void;
}

const { pageSize, itemsCount, currentPage, setPage }: Props = $props();
</script>

<!-- Pagination -->
<div class="flex justify-center items-center gap-3 mt-8">
  {#if currentPage > 0}
    <button 
      onclick={() => setPage(currentPage - 1)}
      class="px-4 py-2 bg-[#CC5500] hover:bg-[#A04000] text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center min-w-11"
    >
      ←
    </button>
  {/if}
  {#if itemsCount > pageSize}
    {#each Array.from({ length: Math.ceil(itemsCount / pageSize) }, (_, i) => i) as pageNum}
      <button 
        onclick={() => setPage(pageNum)}
        class="px-4 py-2 {currentPage === pageNum ? 'bg-[#A04000]' : 'bg-[#CC5500] hover:bg-[#A04000]'} text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center min-w-1111111111111111111111"
      >
        {pageNum + 1}
      </button>
    {/each}
  {/if}
  {#if (currentPage + 1) * pageSize < itemsCount}
    <button 
      onclick={() => setPage(currentPage + 1)}
      class="px-4 py-2 bg-[#CC5500] hover:bg-[#A04000] text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center min-w-11"
    >
      →
    </button>
  {/if}
</div>
