<script lang="ts">
import Pagination from "$lib/components/Pagination.svelte";
import UserCard from "$lib/components/UserCard.svelte";
import { getPersons, getPersonsCount } from "$lib/persons.remote";
import type { City } from "$lib/server/db/schema";
import { getUser } from "$lib/user.remote.js";

const PAGE_SIZE = 12;

const { data } = $props();

const cities = $derived(await data.cities);

// Filters
let searchQuery = $state("");
let selectedCity = $state<City>();
let sortBy = $state<"firstName" | "lastName">("firstName");
let currentPage = $state(0);

const filters = $derived({
  search: searchQuery,
  city: selectedCity?.code,
  sortBy,
});

const persons = $derived(
  await getPersons({
    ...filters,
    offset: currentPage * PAGE_SIZE,
    limit: PAGE_SIZE,
  }),
);

const personsCount = $derived(await getPersonsCount(filters));

function resetCurrentPage() {
  currentPage = 0;
}
</script>

<svelte:head>
  <title>Community Members - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-orange-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page title -->
    <div class="text-center mb-8">
      <h2 class="text-4xl md:text-5xl font-bold text-orange-900 mb-4" style="font-family: Georgia, serif;">
        👥 Our Community
      </h2>
      <p class="text-xl text-orange-800">
        Discover Bibi's Farm members: adopters, associations and volunteers
      </p>
    </div>

    <!-- Search filters -->
    <div class="bg-white rounded-2xl shadow-xl p-6 border-3 border-orange-400 mb-8">
      <h3 class="text-2xl font-bold text-orange-900 mb-6 flex items-center gap-2">
        <span>🔍</span>
        Search for a person
      </h3>

      <!-- Search bar -->
      <div class="mb-6">
        <input
          type="text"
          bind:value={searchQuery}
          onchange={resetCurrentPage}
          placeholder="Search by first name, last name, username or bio..."
          class="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-orange-900 font-medium"
        />
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- City -->
        <div>
          <label class="block text-sm font-bold text-orange-900 mb-2" for="city">City</label>
          <select
            id="city"
            bind:value={selectedCity}
            onchange={resetCurrentPage}
            class="w-full px-4 py-2 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-orange-900 font-medium"
          >
            <option value={undefined}>{"All cities"}</option>
            {#each cities as city}
              <option value={city}>{city.name}</option>
            {/each}
          </select>
        </div>

        <!-- Sorting -->
        <div>
          <label class="block text-sm font-bold text-orange-900 mb-2" for="sortBy">Sort by</label>
          <select
            id="sortBy"
            bind:value={sortBy}
            class="w-full px-4 py-2 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-orange-900 font-medium"
          >
            <option value="firstName">First name (A-Z)</option>
            <option value="lastName">Last name (A-Z)</option>
            <!-- <option value="city">Ville</option> -->
            <!-- <option value="role">Rôle</option> -->
          </select>
        </div>

        <div></div>
      </div>

      <!-- Results -->
      <div class="mt-4 text-orange-900 font-medium">
        {personsCount} {personsCount > 1 ? "people found" : "person found"}
      </div>
    </div>

    <!-- Users -->
    {#if persons.length === 0}
      <div class="text-center py-12">
        <div class="text-6xl mb-4">😢</div>
        <h3 class="text-2xl font-bold text-orange-900 mb-2">No people found</h3>
        <p class="text-orange-700">Try changing your search criteria</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each persons as person (person.id)}
          {@const user = await getUser(person.id)}
          {#if user && !user.isAssociation}
            <div class="transition-all duration-200 hover:-translate-y-1 *:transition-shadow *:hover:shadow-xl *:h-full">
              <UserCard user={user} currentUser={data.currentUser} />
            </div>
          {/if}
        {/each}
      </div>
      <Pagination
        pageSize={PAGE_SIZE}
        itemsCount={personsCount}
        currentPage={currentPage}
        setPage={(page) => currentPage = page}
      />
    {/if}
  </div>
</div>
