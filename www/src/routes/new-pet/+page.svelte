<script lang="ts">
import { resolve } from "$app/paths";
import FileUpload from "$lib/components/FileUpload.svelte";
import FileUploadPreview from "$lib/components/FileUploadPreview.svelte";
import { createPet } from "$lib/pets.remote";
import { TEXT_LIMITS } from "$lib/textLimits";
import { getProfileUrl } from "$lib/user";

const { data } = $props();

let fileUpload = $state<FileUpload>();
</script>

<svelte:head>
  <title>New Pet - Bibi's Farm</title>
</svelte:head>

<div class="bg-[#f5e6d3]">
  <!-- Header -->
  <div class="bg-linear-to-r from-[#CC5500] to-[#A04000] py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl md:text-5xl font-bold text-white text-center mb-4">
        🐾 New Pet
      </h1>
      <p class="text-xl text-white/90 text-center max-w-2xl mx-auto">
        Add a new furry friend to our farm family!
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <form enctype="multipart/form-data" {...createPet}>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left column - Form fields -->
        <div class="space-y-6">
          <div class="bg-[#fef7ed] rounded-2xl shadow-xl p-8 border-4 border-[#8B4513]">
            <h2 class="text-2xl font-bold text-[#8B4513] mb-6 flex items-center gap-2">
              <span>📝</span>
              Basic Information
            </h2>

            <div class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-bold text-[#8B4513] mb-2" for="name">
                  Name
                  <input
                    {...createPet.fields.name.as("text")}
                    placeholder="Garfield"
                    required
                    maxlength={TEXT_LIMITS.PET_NAME}
                    class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
                  />
                </label>
              </div>

              <!-- Species -->
              <div>
                <label class="block text-sm font-bold text-[#8B4513] mb-2" for="species">
                  Species
                  <select
                    id="city"
                    {...createPet.fields.species.as("select")}
                    required
                    class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
                  >
                    <option disabled selected value>-- Select a species -- </option>
                    {#each await data.species as species}
                      <option value={species.name}>{species.name}</option>
                    {/each}
                  </select>
                </label>
              </div>

              <!-- Breed -->
              <div>
                <label class="block text-sm font-bold text-[#8B4513] mb-2" for="breed">
                  Breed
                  <input
                    {...createPet.fields.breed.as("text")}
                    placeholder="Orange Lasagna"
                    required
                    class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
                  />
                </label>
              </div>

              <!-- Birth -->
              <div>
                <label class="block text-sm font-bold text-[#8B4513] mb-2" for="age">
                  Birth
                  <input
                    {...createPet.fields.birth.as("date")}
                    placeholder="8"
                    required
                    min="0"
                    class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium"
                  />
                </label>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-bold text-[#8B4513] mb-2" for="description">
                  Description
                  <textarea
                    {...createPet.fields.description.as("text")}
                    maxlength={TEXT_LIMITS.PET_DESCRIPTION}
                    placeholder="A friendly and playful companion..."
                    rows="4"
                    class="w-full px-4 py-3 border-2 border-[#8B4513] rounded-lg focus:ring-2 focus:ring-[#CC5500] focus:border-transparent outline-none bg-white text-[#8B4513] font-medium resize-none"
                  ></textarea>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column - Photo preview -->
        <div class="space-y-6">
          <!-- Photo upload -->
          <div class="bg-[#fef7ed] rounded-2xl shadow-xl p-8 border-4 border-[#8B4513]">
            <h2 class="text-2xl font-bold text-[#8B4513] mb-6 flex items-center gap-2">
              <span>📸</span>
              Photo
            </h2>

            <!-- Preview or placeholder -->
            <div class="mb-6">
              <FileUploadPreview fileUpload={fileUpload} placeholder={previewPlaceholder} />
              {#snippet previewPlaceholder()}
                <div class="aspect-video rounded-xl border-2 border-dashed border-[#8B4513] flex items-center justify-center bg-[#fef7ed]">
                  <div class="text-center">
                    <span class="text-6xl mb-4 block">🐾</span>
                    <p class="text-[#8B4513] font-medium">No photo yet</p>
                  </div>
                </div>
              {/snippet}
            </div>

            <!-- Upload button -->
            <label class="block">
              <FileUpload bind:this={fileUpload} name="avatar" accept="image/*" />
              <div class="w-full py-3 bg-[#CC5500] text-white rounded-lg font-bold text-center hover:bg-[#A04000] transition-all cursor-pointer">
                📷 {fileUpload?.hasFile() ? "Change photo" : "Add photo"}
              </div>
            </label>
          </div>

          <!-- Submit button -->
          <div class="bg-[#fef7ed] rounded-2xl shadow-xl p-6 border-4 border-[#8B4513]">
            <button
              type="submit"
              class="w-full py-4 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-lg font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl"
            >
              🐾 Create Pet
            </button>

            <div class="text-center mt-4">
              <a
                href={data.currentUser && resolve(getProfileUrl(data.currentUser))}
                class="text-[#8B4513] hover:text-[#CC5500] font-semibold transition-colors"
              >
                ← Cancel and go back
              </a>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
