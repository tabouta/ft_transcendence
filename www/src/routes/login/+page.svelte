<script lang="ts">
import { resolve } from "$app/paths";
import * as remote from "$lib/auth.remote";

let errorMessage = $state<string>();
</script>

<svelte:head>
  <title>Login - Bibi's Farm</title>
</svelte:head>

<div class="bg-linear-to-br from-rose-100 via-amber-100 to-orange-200 flex items-center justify-center p-4">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-yellow-300/30 to-orange-400/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-br from-rose-300/30 to-pink-400/30 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-linear-to-br from-amber-300/20 to-yellow-400/20 rounded-full blur-3xl"></div>
  </div>

  <div class="w-full max-w-md relative z-10">
    <!-- Card -->
    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border-2 border-amber-200">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Welcome</h1>
        <p class="text-gray-600">Log into Bibi's Farm</p>
      </div>

      <!-- Form -->
      <form {...remote.login.enhance(async ({ submit }) => {
        errorMessage = undefined;
        try {
          await submit();
        } catch (error: any) {
          errorMessage = error?.message || "Login failed";
        }
      })}>
        <!-- First and Last name on the same line -->
        <!-- Email -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="your@email.com"
          />
        </div>

        <!-- Password  -->
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="••••••••"
          />
        </div>

        <!-- Error Message -->
        {#if errorMessage}
          <div class="bg-red-50 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{errorMessage}</span>
          </div>
        {/if}

        <!-- Submit -->
        <button
          type="submit"
          class="mt-2 w-full bg-linear-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 focus:ring-4 focus:ring-amber-300 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Log in
        </button>
      </form>


      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <!-- Login  -->
      <div class="text-center">
        <p class="text-gray-600">
          Don't have an account yet ?
          <a href={resolve("/register")} class="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
            Register
          </a>
        </p>
      </div>
    </div>
    <!-- Terms and Privacy -->
    <p class="text-center text-sm text-gray-500 mt-6">
      By logging in, you agree to our
      <a href="/terms" class="text-amber-600 hover:text-amber-700 underline">terms of use</a>
      and our
      <a href="/privacy" class="text-amber-600 hover:text-amber-700 underline">privacy policy</a>
    </p>
  </div>
</div>
