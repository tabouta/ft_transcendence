<script lang="ts">
import * as remote from "$lib/auth.remote";
import { TEXT_LIMITS } from "$lib/textLimits";

const { data } = $props();

let isAssociation = $state(false);

// Person fields
let firstName = $state<string>("");
let lastName = $state<string>("");

// Association fields
let associationName = $state<string>("");
let phone = $state<string>("");
let foundedAt = $state<string>("");

// Common fields
let password = $state<string>("");
let confirm = $state<string>("");
let confirmField = $state<HTMLInputElement>();
let errorMessage = $state<string>();

$effect(() =>
  confirmField?.setCustomValidity(
    password == confirm ? "" : "Passwords do not match",
  ),
);

// const defaultUsername = $derived(`${firstName.toLowerCase()}${lastName.toLowerCase()}`);
</script>

<svelte:head>
  <title>Register - Bibi's Farm</title>
</svelte:head>

<div class="bg-linear-to-br from-rose-100 via-amber-100 to-orange-200 flex items-center justify-center p-4">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-yellow-300/30 to-orange-400/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-br from-rose-300/30 to-pink-400/30 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-linear-to-br from-amber-300/20 to-yellow-400/20 rounded-full blur-3xl"></div>
  </div>

  <div class="w-full max-w-md relative">
    <!-- Card -->
    <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border-2 border-amber-200">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Create an account</h1>
        <p class="text-gray-600">Join us today</p>
      </div>

      <!-- Toggle between Person and Association -->
      <div class="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onclick={() => isAssociation = false}
          class={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            !isAssociation 
              ? 'bg-white text-amber-600 shadow-md' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👤 Person
        </button>
        <button
          type="button"
          onclick={() => isAssociation = true}
          class={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            isAssociation 
              ? 'bg-white text-amber-600 shadow-md' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏛️ Association
        </button>
      </div>

      <!-- Form -->
      {#if isAssociation}
      <form {...remote.registerAssociation.enhance(async ({ submit }) => {
        errorMessage = undefined;
        try {
          await submit();
        } catch (error: any) {
          errorMessage = error?.message || "Registration failed";
        }
      })}>
        <!-- Association Name -->
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">
            Association Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxlength={TEXT_LIMITS.ASSOCIATION_NAME}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="Farm Animals Sanctuary"
            bind:value={associationName}
          />
        </div>

        <!-- Phone -->
        <div class="space-y-2">
          <label for="phone" class="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="06 12 34 56 78"
            bind:value={phone}
          />
        </div>

        <!-- Association Type -->
        <div class="space-y-2">
          <label for="type" class="block text-sm font-medium text-gray-700">
            Association Type
          </label>
          <select
            id="type"
            name="type"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
          >
            <option disabled selected value>-- Select type --</option>
            <option value="Sanctuary">🏛️ Sanctuary</option>
            <option value="Rescue">🚑 Rescue</option>
            <option value="Adoption">🏠 Adoption</option>
            <option value="Care">💚 Care</option>
          </select>
        </div>

        <!-- Founded Date -->
        <div class="space-y-2">
          <label for="foundedAt" class="block text-sm font-medium text-gray-700">
            Founded Date
          </label>
          <input
            id="foundedAt"
            name="foundedAt"
            type="date"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            bind:value={foundedAt}
          />
        </div>

        <!-- City -->
        <div class="space-y-2">
          <label for="city" class="block text-sm font-medium text-gray-700">
            City
          </label>
          <select
            id="city"
            name="city"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
          >
            <option disabled selected value>-- Select a city -- </option>
            {#each await data.cities as city}
              <option value={city.code}>{city.name}</option>
            {/each}
          </select>
        </div>

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
            placeholder="contact@yourorganization.com"
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
            minlength={8}
            pattern={"(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"}
            title="Min. 8 characters with uppercase, lowercase, digit and special character"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="••••••••"
            bind:value={password}
          />
          <p class="text-xs text-gray-500">Min. 8 characters with uppercase, lowercase, digit and special character.</p>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="••••••••"
            bind:value={confirm}
            bind:this={confirmField}
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
          Create Association Account
        </button>
      </form>
      {:else}
      <form {...remote.registerPerson.enhance(async ({ submit }) => {
        errorMessage = undefined;
        try {
          await submit();
        } catch (error: any) {
          errorMessage = error?.message || "Registration failed";
        }
      })}>
        <!-- First and Last name on the same line -->
        <div class="grid grid-cols-2 gap-4">
          <!-- First name -->
          <div class="space-y-2">
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              maxlength={TEXT_LIMITS.USER_FIRST_NAME}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
              placeholder="First name"
              bind:value={firstName}
            />
          </div>

          <!-- Last name -->
          <div class="space-y-2">
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              maxlength={TEXT_LIMITS.USER_LAST_NAME}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
              placeholder="Last name"
              bind:value={lastName}
            />
          </div>
        </div>

        <!-- Birthdate -->
        <!-- <div class="space-y-2"> -->
        <!--   <label for="birthdate" class="block text-sm font-medium text-gray-700"> -->
        <!--     Date of birth -->
        <!--   </label> -->
        <!--   <input -->
        <!--     id="birthdate" -->
        <!--     name="birthdate" -->
        <!--     type="date" -->
        <!--     required -->
        <!--     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400" -->
        <!--   /> -->
        <!-- </div> -->
        <!---->
        <!-- Phone -->
        <!-- <div class="space-y-2"> -->
        <!--   <label for="phone" class="block text-sm font-medium text-gray-700"> -->
        <!--     Phone number -->
        <!--   </label> -->
        <!--   <input -->
        <!--     id="phone" -->
        <!--     name="phone" -->
        <!--     type="tel" -->
        <!--     required -->
        <!--     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400" -->
        <!--     placeholder="06 12 34 56 78" -->
        <!--   /> -->
        <!-- </div> -->
        <!---->
        <!-- Username -->
        <!-- <div class="space-y-2"> -->
        <!--   <label for="username" class="block text-sm font-medium text-gray-700"> -->
        <!--     Username -->
        <!--   </label> -->
        <!--   <input -->
        <!--     id="username" -->
        <!--     name="username" -->
        <!--     type="text" -->
        <!--     required -->
        <!--     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400" -->
        <!--     placeholder={defaultUsername || "Enter your username"} -->
        <!--   /> -->
        <!-- </div> -->

        <!-- City -->
        <div class="space-y-2">
          <label for="city" class="block text-sm font-medium text-gray-700">
            City
          </label>
          <select
            id="city"
            name="city"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
          >
            <option disabled selected value>-- Select a city -- </option>
            {#each await data.cities as city}
              <option value={city.code}>{city.name}</option>
            {/each}
          </select>
        </div>

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
            minlength={8}
            pattern={"(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"}
            title="Min. 8 characters with uppercase, lowercase, digit and special character"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="••••••••"
            bind:value={password}
          />
          <p class="text-xs text-gray-500">Min. 8 characters with uppercase, lowercase, digit and special character.</p>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
            placeholder="••••••••"
            bind:value={confirm}
            bind:this={confirmField}
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
          Sign up
        </button>
      </form>
      {/if}


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
          Already have an account?
          <a href="/login" class="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
            Log in
          </a>
        </p>
      </div>
    </div>
    <!-- Terms and Privacy -->
    <p class="text-center text-sm text-gray-500 mt-6">
      By signing up, you agree to our
      <a href="/terms" class="text-amber-600 hover:text-amber-700 underline">terms of use</a>
      and our
      <a href="/privacy" class="text-amber-600 hover:text-amber-700 underline">privacy policy</a>
    </p>
  </div>
</div>
