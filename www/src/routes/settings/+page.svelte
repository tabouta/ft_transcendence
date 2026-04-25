<script lang="ts">
import {
  deleteAccount,
  requestGdprExport,
  updateCredentials,
} from "$lib/auth.remote";
import { getApiKey } from "$lib/user.remote.js";

const { data } = $props();

const sections = [
  // {
  //   name: "Profile",
  //   icon: "👤",
  //   description: "Manage your personal information.",
  // },
  {
    name: "Account settings",
    icon: "🔒",
    description:
      "Manage your security settings, including your password and authentication factors.",
    snippet: accountSettingsSnippet,
  },
  // { name: "Privacy", icon: "🔐", description: "Set your data sharing and privacy preferences." },
  {
    name: "Account actions",
    icon: "🔒",
    description: "Manage your data and account",
    snippet: accountActionsSnippet,
  },
  {
    name: "Developer tools",
    icon: "🛠️",
    description: "Get your API key",
    snippet: developerSnippet,
  },
];

type Section = (typeof sections)[number];

let selectedSection = $state<Section>(sections[0]);

let email = $state<string>();
let password = $state<string>("");
let confirmPassword = $state<string>("");
let confirmPasswordField = $state<HTMLInputElement>();

$effect(() =>
  confirmPasswordField?.setCustomValidity(
    password == confirmPassword ? "" : "Passwords do not match",
  ),
);
</script>

<svelte:head>
  <title>Settings - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen bg-[#f5e6d3] flex">
  <!-- Sidebar -->
  <aside class="w-80 bg-linear-to-b from-[#fef7ed] to-[#f5e6d3] border-r-4 border-[#8B4513] p-6">
    <h2 class="text-3xl font-bold text-[#8B4513] mb-6">⚙️ Settings</h2>
    <div class="space-y-2">
      {#each sections as section}
        <button
          class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all font-semibold flex items-center gap-3 {selectedSection === section
            ? 'bg-[#CC5500] text-white border-[#CC5500] shadow-lg' 
            : 'bg-white text-[#8B4513] border-[#8B4513] hover:bg-[#f5e6d3]'}"
          onclick={() => (selectedSection = section)}
        >
          <span class="text-xl">{section.icon}</span>
          <span>{section.name}</span>
        </button>
      {/each}
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-[#8B4513] mb-2">{selectedSection.name}</h1>
      <p class="text-lg text-[#A0522D]">{selectedSection.description}</p>
    </div>

    <!-- Settings Panel -->
    <div class="bg-[#fef7ed] rounded-2xl shadow-xl p-8 border-4 border-[#8B4513] max-w-2xl">
      {@render selectedSection.snippet()}
    </div>
  </main>
</div>

<!-- {#snippet profileSnippet()} -->
<!--   <form class="space-y-6"> -->
<!--     <div> -->
<!--       <label class="block text-sm font-bold text-[#8B4513] mb-2"> -->
<!--         Username -->
<!--         <input  -->
<!--           type="text"  -->
<!--           placeholder="Modify your username..."  -->
<!--           class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium" -->
<!--         /> -->
<!--       </label> -->
<!--     </div> -->
<!--     <div> -->
<!--       <label class="block text-sm font-bold text-[#8B4513] mb-2"> -->
<!--         Confirm Username -->
<!--         <input  -->
<!--           type="text"  -->
<!--           placeholder="Verification of your new username..."  -->
<!--           class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium" -->
<!--         /> -->
<!--       </label> -->
<!--     </div> -->
<!--     <button  -->
<!--       type="submit"  -->
<!--       class="w-full py-3 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-lg font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl" -->
<!--     > -->
<!--       💾 Save Changes -->
<!--     </button> -->
<!--   </form> -->
<!-- {/snippet} -->

{#snippet accountSettingsSnippet()}
  <form {...updateCredentials} class="space-y-6">
    <div>
      <label class="block text-sm font-bold text-[#8B4513] mb-2">
        Current Password
        <input 
          placeholder="Enter your current password..." 
          required 
          {...updateCredentials.fields.currentPassword.as("password")} 
          class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
        />
      </label>
    </div>
    <div>
      <label class="block text-sm font-bold text-[#8B4513] mb-2">
        Email
        <input 
          placeholder="Modify your email..." 
          bind:value={email} 
          {...updateCredentials.fields.email.as("email")} 
          class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
        />
      </label>
    </div>
    <div>
      <label class="block text-sm font-bold text-[#8B4513] mb-2">
        New Password
        <input
          placeholder="Enter your new password..."
          bind:value={password}
          minlength={8}
          pattern={"(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"}
          title="Min. 8 characters with uppercase, lowercase, digit and special character"
          {...updateCredentials.fields.password.as("password")}
          class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
        />
      </label>
      <p class="text-xs text-[#A0522D] mt-1">Min. 8 characters with uppercase, lowercase, digit and special character.</p>
    </div>
    <div>
      <label class="block text-sm font-bold text-[#8B4513] mb-2">
        Confirm Password
        <input 
          placeholder="Confirm your new password..." 
          bind:value={confirmPassword} 
          bind:this={confirmPasswordField} 
          type="password"
          class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
        />
      </label>
    </div>
    <button 
      type="submit" 
      class="w-full py-3 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-lg font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl"
    >
      💾 Save Changes
    </button>
  </form>
{/snippet}

{#snippet accountActionsSnippet()}
  <div class="flex flex-col space-y-3">
    <div class="flex flex-col">
      <p class="block text-sm font-bold text-[#8B4513] mb-2">GDPR data request</p>
      <p class="text-sm text-[#A0522D] mb-2">A confirmation link will be sent to your email.</p>
      <form {...requestGdprExport}>
        <button
          type="submit"
          class="w-full text-center py-3 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-lg font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl"
        >
          Download your data
        </button>
      </form>
    </div>
    <form {...deleteAccount}>
      <div>
        <label class="block text-sm font-bold text-[#8B4513] mb-2">
          Password
          <input
            placeholder="Enter your current password..."
            required
            {...deleteAccount.fields.password.as("password")}
            class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
          />
        </label>
      </div>
      <p class="text-sm text-[#A0522D] mb-2">A confirmation link will be sent to your email.</p>
      <button
        type="submit"
        class="w-full py-3 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-lg font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl"
      >
        Delete account
      </button>
    </form>
  </div>
{/snippet}

{#snippet developerSnippet()}
  {@const apiKey = await getApiKey(data.currentUser.id)}
  <div>
    <p>API Key :</p>
    <p class="w-fit py-1 px-1 rounded border-2 border-gray-800 bg-gray-200">
      <span class="px-1">{apiKey}</span>
      <button
        class="px-1 rounded border border-gray-800 bg-gray-300"
        onclick={async () => apiKey && await navigator.clipboard.writeText(apiKey)}
      >
        📋
      </button>
    </p>
  </div>
{/snippet}
