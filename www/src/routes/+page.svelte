<script lang="ts">
import { resolve } from "$app/paths";

let currentFeature = $state(0);
const features = [
  {
    icon: "🐾",
    title: "Meet Amazing Animals",
    description:
      "Discover farm animals looking for loving homes and share their stories",
  },
  {
    icon: "💬",
    title: "Connect with Others",
    description:
      "Chat with animal lovers from around the world and share your passion",
  },
  {
    icon: "🏡",
    title: "Find Your Companion",
    description:
      "Browse adoptable animals and connect with shelters and owners directly",
  },
];

// Auto-rotate features
$effect(() => {
  const interval = setInterval(() => {
    currentFeature = (currentFeature + 1) % features.length;
  }, 4000);

  return () => clearInterval(interval);
});
</script>

<svelte:head>
	<title>Bibi's Farm - A Community for Farm Animal Lovers</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-orange-100">
	<!-- Hero Section -->
	<div class="relative overflow-hidden">
		<!-- Background image -->
		<div class="absolute inset-0">
			<img 
				src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop" 
				alt="Farm" 
				class="w-full h-full object-cover opacity-30"
			/>
			<div class="absolute inset-0 bg-linear-to-br from-orange-50/90 via-yellow-50/90 to-orange-100/90"></div>
		</div>

		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
			<div class="text-center">
				<h1 class="text-5xl md:text-7xl font-bold text-orange-900 mb-6" style="font-family: Georgia, serif;">
					Welcome to Bibi's Farm 🌾
				</h1>
				<p class="text-xl md:text-2xl text-orange-800 mb-8 max-w-3xl mx-auto">
					The social network dedicated to farm animals and their passionate caretakers
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a 
						href={resolve("/register")}
						class="px-8 py-4 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-xl font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
					>
						Join the Community 🚀
					</a>
					<a 
						href={resolve("/pets")}
						class="px-8 py-4 bg-white border-3 border-orange-700 text-orange-900 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
					>
						Discover Animals 🐾
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<h2 class="text-3xl md:text-4xl font-bold text-orange-900 text-center mb-12">
			Why Join Bibi's Farm?
		</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each features as feature, index}
				<div 
					class="bg-white rounded-2xl shadow-xl p-8 border-4 border-orange-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl {currentFeature === index ? 'ring-4 ring-orange-500' : ''}"
				>
					<div class="text-6xl mb-4 text-center">{feature.icon}</div>
					<h3 class="text-2xl font-bold text-orange-900 mb-3 text-center">{feature.title}</h3>
					<p class="text-gray-700 text-center leading-relaxed">{feature.description}</p>
				</div>
			{/each}
		</div>

		<!-- Feature indicator dots -->
		<div class="flex justify-center gap-2 mt-8">
			{#each features as _, index}
				<button
					onclick={() => currentFeature = index}
					class="w-3 h-3 rounded-full transition-all {currentFeature === index ? 'bg-orange-600 w-8' : 'bg-orange-300 hover:bg-orange-400'}"
					aria-label="Feature {index + 1}"
				></button>
			{/each}
		</div>
	</div>

	<!-- Stats Section -->
	<div class="bg-linear-to-r from-[#CC5500] to-[#A04000] py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
				<div class="text-white">
					<div class="text-5xl font-bold mb-2">500+</div>
					<div class="text-xl text-white/90">Animals</div>
				</div>
				<div class="text-white">
					<div class="text-5xl font-bold mb-2">1,000+</div>
					<div class="text-xl text-white/90">Members</div>
				</div>
				<div class="text-white">
					<div class="text-5xl font-bold mb-2">200+</div>
					<div class="text-xl text-white/90">Adoptions</div>
				</div>
			</div>
		</div>
	</div>

	<!-- How it Works Section -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<h2 class="text-3xl md:text-4xl font-bold text-orange-900 text-center mb-12">
			How It Works
		</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			<div class="text-center">
				<div class="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-400">
					<span class="text-3xl">1️⃣</span>
				</div>
				<h3 class="text-xl font-bold text-orange-900 mb-2">Create Account</h3>
				<p class="text-gray-700">Sign up in seconds and join our community</p>
			</div>
			
			<div class="text-center">
				<div class="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-400">
					<span class="text-3xl">2️⃣</span>
				</div>
				<h3 class="text-xl font-bold text-orange-900 mb-2">Browse Animals</h3>
				<p class="text-gray-700">Discover amazing farm animals and their stories</p>
			</div>
			
			<div class="text-center">
				<div class="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-400">
					<span class="text-3xl">3️⃣</span>
				</div>
				<h3 class="text-xl font-bold text-orange-900 mb-2">Connect</h3>
				<p class="text-gray-700">Chat with owners and other animal lovers</p>
			</div>
			
			<div class="text-center">
				<div class="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-orange-400">
					<span class="text-3xl">4️⃣</span>
				</div>
				<h3 class="text-xl font-bold text-orange-900 mb-2">Adopt</h3>
				<p class="text-gray-700">Give a loving home to your new companion</p>
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="bg-linear-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-2xl p-12 border-4 border-orange-700 text-center">
			<h2 class="text-3xl md:text-4xl font-bold text-orange-900 mb-4">
				Ready to Get Started?
			</h2>
			<p class="text-xl text-gray-700 mb-8">
				Join thousands of animal lovers on Bibi's Farm today!
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href={resolve("/register")}
					class="px-8 py-4 bg-linear-to-r from-[#CC5500] to-[#A04000] text-white rounded-xl font-bold text-lg hover:from-[#DD6611] hover:to-[#B05011] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
				>
					Create Free Account 🎉
				</a>
				<a 
					href={resolve("/login")}
					class="px-8 py-4 bg-white border-3 border-orange-700 text-orange-900 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
				>
					Sign In
				</a>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="bg-orange-900 text-white py-12 mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div>
					<h3 class="text-2xl font-bold mb-4">Bibi's Farm 🌾</h3>
					<p class="text-white/80">
						Connecting farm animals with loving families since 2025
					</p>
				</div>
				<div>
					<h4 class="text-lg font-bold mb-4">Quick Links</h4>
					<ul class="space-y-2">
						<li><a href={resolve("/pets")} class="text-white/80 hover:text-white transition-colors">Animals</a></li>
						<li><a href={resolve("/persons")} class="text-white/80 hover:text-white transition-colors">Community</a></li>
						<li><a href={resolve("/help")} class="text-white/80 hover:text-white transition-colors">Help</a></li>
					</ul>
				</div>
				<div>
					<h4 class="text-lg font-bold mb-4">Legal</h4>
					<ul class="space-y-2">
						<li><a href={resolve("/terms")} class="text-white/80 hover:text-white transition-colors">Terms of Service</a></li>
						<li><a href={resolve("/privacy")} class="text-white/80 hover:text-white transition-colors">Privacy Policy</a></li>
						<li><a href="mailto:contact@lafermeabibi.com" class="text-white/80 hover:text-white transition-colors">Contact</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
				<p>&copy; 2026 Bibi's Farm. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
