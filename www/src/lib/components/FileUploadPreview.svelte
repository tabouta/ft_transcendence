<script lang="ts">
import type { Snippet } from "svelte";
import FileUpload from "$lib/components/FileUpload.svelte";

const {
  fileUpload,
  placeholder,
  class: classes,
}: {
  fileUpload?: FileUpload;
  placeholder?: Snippet;
  class?: string;
} = $props();

let progress = $state<number>();

const previewUrl = $derived.by(() => {
  const file = fileUpload?.getFile();
  return file ? URL.createObjectURL(file) : "";
});

export function uploadStart() {
  progress = 0;
}

export function uploadDone() {
  setTimeout(() => (progress = undefined), 500);
}

export function setProgress(value: number) {
  progress = Math.max(0, Math.min(value, 1));
}
</script>

{#if progress !== undefined}
  <div class="{classes} relative aspect-video rounded-xl overflow-hidden border-4 border-orange-700 bg-linear-to-br from-yellow-50 to-orange-50 p-6 flex flex-col items-center justify-center">
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">📤</div>
      <p class="text-lg font-bold text-orange-900">Uploading...</p>
      <p class="text-sm text-orange-700">{Math.round(progress * 100)}%</p>
    </div>
    <div class="w-full max-w-md">
      <div class="h-4 bg-orange-200 rounded-full overflow-hidden border-2 border-orange-700 shadow-inner">
        <div 
          class="h-full bg-linear-to-r from-[#CC5500] to-[#A04000] transition-all duration-300 ease-out rounded-full shadow-lg"
          style="width: {progress * 100}%"
        ></div>
      </div>
    </div>
  </div>
{:else if fileUpload && fileUpload.hasFile()}
  <div class="{classes} relative aspect-video rounded-xl overflow-hidden border-2 border-[#8B4513]">
    <img
      src={previewUrl}
      alt="Preview"
      class="w-full h-full object-cover"
    />
    <button
      aria-label="Remove image"
      type="button"
      onclick={fileUpload.clearFiles}
      class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
{:else if placeholder}
  {@render placeholder()}
{/if}
