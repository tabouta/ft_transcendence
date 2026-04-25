<script lang="ts">
import { onMount } from "svelte";
import {
  getAssociations,
  getAssociationsCount,
} from "$lib/associations.remote";
import AssociationCard from "$lib/components/AssociationCard.svelte";
import Pagination from "$lib/components/Pagination.svelte";
import type { AssociationType, City } from "$lib/server/db/schema";
import { getUser } from "$lib/user.remote.js";

const PAGE_SIZE = 12;

let { data } = $props();

let searchQuery = $state("");
let selectedType = $state<AssociationType>();
let selectedCity = $state<City>();
let sortBy = $state<"name" | "type">("name");
let currentPage = $state(0);

const cities = $derived(await data.cities);

const filters = $derived({
  search: searchQuery,
  type: selectedType,
  city: selectedCity?.code,
  sortBy,
});

const associations = $derived(
  await getAssociations({
    ...filters,
    offset: currentPage * PAGE_SIZE,
    limit: PAGE_SIZE,
  }),
);

const associationsCount = $derived(await getAssociationsCount(filters));

onMount(async () => {
  searchQuery = data.filters.search;
  selectedType = data.filters.type;
  [selectedCity] = (await data.filters.city) ?? [undefined];
  sortBy = data.filters.sort;
});

function resetCurrentPage() {
  currentPage = 0;
}
</script>

<svelte:head>
  <title>Associations - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-orange-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page title -->
    <div class="text-center mb-8">
      <h2 class="text-4xl md:text-5xl font-bold text-orange-900 mb-4" style="font-family: Georgia, serif;">
        🏛️ Animal Associations
      </h2>
      <p class="text-xl text-orange-800">
        Discover associations dedicated to animal welfare
      </p>
    </div>

    <!-- Search filters -->
    <div class="bg-white rounded-2xl shadow-xl p-6 border-4 border-orange-400 mb-8">
      <h3 class="text-2xl font-bold text-orange-900 mb-6 flex items-center gap-2">
        <span>🔍</span>
        Find an association
      </h3>

      <!-- Search bar -->
      <div class="mb-6">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by name or description..."
          class="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-orange-900 font-medium"
        />
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Type -->
        <div>
          <label class="block text-sm font-bold text-orange-900 mb-2" for="type">Type</label>
          <select
            id="type"
            bind:value={selectedType}
            onchange={resetCurrentPage}
            class="w-full px-4 py-2 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-orange-900 font-medium"
          >
            <option value={undefined}>All</option>
            {#each data.associationTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        <!-- City -->
        <div>
          <label class="block text-sm font-bold text-orange-900 mb-2" for="city">City</label>
          <select
            id="city"
            bind:value={selectedCity}
            onchange={resetCurrentPage}
            class="w-full px-4 py-2 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-orange-900 font-medium"
          >
            <option value={undefined}>All</option>
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
            <option value="name">Name (A-Z)</option>
            <option value="city">City</option>
            <option value="type">Type</option>
            <option value="animalsCount">Animals count</option>
          </select>
        </div>

        <div></div>
      </div>

      <!-- Results -->
      <div class="mt-4 text-orange-900 font-medium">
        {associationsCount} {associationsCount > 1 ? "associations found" : "association found"}
      </div>
    </div>

    <!-- Associations -->
    {#if associations.length === 0}
      <div class="text-center py-12">
        <div class="text-6xl mb-4">😢</div>
        <h3 class="text-2xl font-bold text-orange-900 mb-2">No association found</h3>
        <p class="text-orange-700">Try modifying your search criteria</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each associations as association (association.id)}
          {@const user = await getUser(association.id)}
          {#if user && user.isAssociation}
            <AssociationCard association={user} currentUser={data.currentUser} />
          {/if}
        {/each}
      </div>
      <Pagination
        pageSize={PAGE_SIZE}
        itemsCount={associationsCount}
        currentPage={currentPage}
        setPage={(page) => currentPage = page}
      />
    {/if}
  </div>
</div>
