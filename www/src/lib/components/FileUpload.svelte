<script lang="ts">
import { PUBLIC_MAX_FILE_SIZE } from "$env/static/public";

const {
  name,
  accept,
  required = false,
}: { name: string; accept: string; required?: boolean } = $props();

let input = $state<HTMLInputElement>();
export function getInput() {
  return input;
}

let files = $state<FileList>();
export function getFile() {
  return files?.item(0);
}

export function hasFile() {
  return files && files?.length > 0;
}

export function clearFiles() {
  files = new DataTransfer().files;
}

$effect(() => {
  const file = files?.item(0);
  if (file) {
    input?.setCustomValidity(
      file.size < Number(PUBLIC_MAX_FILE_SIZE) ? "" : "File is too large",
    );
  }
});
</script>

<input
  name={name}
  accept={accept}
  required={required}
  type="file"
  autocomplete="off"
  class="hidden"
  bind:files
/>
