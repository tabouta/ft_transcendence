<script lang="ts" generics="Input extends RemoteFormInput | void, Output">
import type { RemoteForm, RemoteFormInput, RemoteQuery } from "@sveltejs/kit";
import type { Snippet } from "svelte";

const {
  children,
  class: classes,
  function: remoteFunction,
  updates,
  then,
  onloadstart,
  onloadend,
  onprogress,
  onerror,
}: {
  children: Snippet;
  function: RemoteForm<Input, Output>;
  updates?: Array<RemoteQuery<any>>;
  then?: () => void | Promise<void>;
  class?: string;
  onloadstart?: () => void;
  onloadend?: () => void;
  onprogress?: (progress: number) => void;
  onerror?: (message: string) => void;
} = $props();

let errorMessage = $state<string>();

export function clearError() {
  errorMessage = undefined;
}

async function submitXHR(data: FormData) {
  return new Promise<void>((resolve, reject) => {
    var size = Array.from(data.values())
      .map((value: FormDataEntryValue) =>
        typeof value === "string" ? new Blob([value]).size : value.size,
      )
      .reduce((acc, n) => acc + n, 0);

    var request = new XMLHttpRequest();

    if (onloadstart) {
      request.upload.onloadstart = onloadstart;
    }

    if (onloadend) {
      request.upload.onloadend = onloadend;
    }

    if (onprogress) {
      request.upload.onprogress = (e) => onprogress(e.loaded / size);
    }

    const action = remoteFunction.action.replace(
      /\?\/remote=(.+)%2F(.+)/,
      "$1/$2",
    );
    request.open(remoteFunction.method, `/_app/remote/${action}`);
    request.timeout = 45000;
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        try {
          const response = JSON.parse(request.responseText);
          reject(new Error(response.message || "Request failed"));
        } catch {
          reject(new Error("Request failed"));
        }
      }
    };
    request.onerror = () => reject(new Error("Network error"));
    request.ontimeout = () => reject(new Error("Request timeout"));
    request.send(data);
  });
}
</script>

<form
  class={classes}
  enctype="multipart/form-data"
  {...remoteFunction.enhance(async ({ form, data }) => {
    if (typeof data !== "object") {
      return;
    }
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value as string | Blob);
    }
    try {
      errorMessage = undefined;
      await submitXHR(formData);
      form.reset();
      if (updates) {
        await Promise.all(updates.map(query => query.refresh()));
      }
      if (then) {
        await then();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      errorMessage = message;
      if (onerror) {
        onerror(message);
      }
    }
  })}
>
  {#if errorMessage}
    <div class="mb-4 bg-red-50 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
      <svg class="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span class="font-medium">{errorMessage}</span>
    </div>
  {/if}
  {@render children()}
</form>
