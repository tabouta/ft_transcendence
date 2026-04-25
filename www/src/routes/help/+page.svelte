<script lang="ts">
let openIndex = $state<number>();

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Click on the 'Register' button in the top right corner of the homepage. Fill in your information (name, email, password) and follow the instructions.",
  },
  {
    question: "How can I adopt a pet?",
    answer:
      "Browse through the pets available for adoption in the 'Pets' section. When you find a pet you're interested in, click on their profile and use the 'Contact' button to get in touch with the current owner or shelter. You can then discuss the adoption process directly through our messaging system.",
  },
  {
    question: "How do I add a new pet to my profile?",
    answer:
      "Go to the 'New Pet' section from the navigation menu. Fill in all the required information about your pet (name, species, breed, age, description) and upload photos. Once submitted, your pet will appear on your profile and in the pets directory.",
  },
  {
    question: "How does the messaging system work?",
    answer:
      "You can send messages to other users by visiting their profile and clicking the 'Message' button. All your conversations are accessible from the 'Messages' section in the main menu. You'll receive notifications when someone sends you a message.",
  },
  {
    question: "How do I add friends?",
    answer:
      "Visit another user's profile and click the 'Add Friend' button. They'll receive a friend request that they can accept or decline. Once accepted, you'll be able to see each other's posts and interact more easily on the platform.",
  },
  {
    question: "Can I edit my pet's information?",
    answer:
      "Yes! Go to your pet's profile page and click on the 'Edit' button. You can update any information, add new photos, or change the adoption status.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to 'Settings' and scroll down to the 'Account actions' section. Click on 'Delete Account' and follow the confirmation steps. Please note that this action is permanent and cannot be undone.",
  },
  {
    question: "Can I share photos of my pets?",
    answer:
      "Absolutely! You can share photos by creating posts on your feed. You can also add multiple photos to your pet's profile. Make sure the photos are clear and showcase your pet in the best light!",
  },
  {
    question: "How do I know if someone is interested in adopting my pet?",
    answer:
      "You'll receive a message notification when someone contacts you about adoption. All adoption inquiries will appear in your Messages inbox where you can discuss details with potential adopters.",
  },
];

function toggleFaq(index: number) {
  openIndex = openIndex === index ? undefined : index;
}
</script>

<svelte:head>
	<title>Help & FAQ - Bibi's Farm</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-orange-100">
	<main class="max-w-4xl mx-auto p-8">
		<div class="bg-white rounded-xl shadow-lg border-3 border-orange-400 p-8">
			<div class="text-center mb-8">
				<h1 class="text-4xl font-bold text-orange-900 mb-3" style="font-family: Georgia, serif;">
					Help & FAQ
				</h1>
				<p class="text-lg text-gray-600">
					Find answers to frequently asked questions
				</p>
			</div>

			<!-- FAQ Section -->
			<div class="space-y-4 mb-12">
				{#each faqs as faq, index}
					<div class="border-2 border-orange-200 rounded-lg overflow-hidden transition-all hover:border-orange-400">
						<button
							onclick={() => toggleFaq(index)}
							class="w-full px-6 py-4 text-left bg-orange-50 hover:bg-orange-100 transition-colors flex justify-between items-center"
						>
							<span class="font-semibold text-orange-900 text-lg">
								{faq.question}
							</span>
							<svg 
								class="w-6 h-6 text-orange-600 transition-transform duration-300 {openIndex === index ? 'rotate-180' : ''}"
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
							</svg>
						</button>
						{#if openIndex === index}
							<div class="px-6 py-4 bg-white">
								<p class="text-gray-700 leading-relaxed">
									{faq.answer}
								</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Contact Section -->
			<div class="border-t-2 border-orange-200 pt-8">
				<h2 class="text-2xl font-bold text-orange-800 mb-4">
					Still Need Help?
				</h2>
				<div class="bg-orange-50 rounded-lg p-6 space-y-4">
					<p class="text-gray-700">
						If you couldn't find the answer to your question, feel free to contact us:
					</p>
					<div class="space-y-2">
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
							</svg>
							<span class="text-gray-700">
								General inquiries: 
								<a href="mailto:contact@bibisfarm.com" class="text-orange-600 hover:text-orange-800 underline font-medium">
									contact@bibisfarm.com
								</a>
							</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
							</svg>
							<span class="text-gray-700">
								Legal questions: 
								<a href="mailto:legal@bibisfarm.com" class="text-orange-600 hover:text-orange-800 underline font-medium">
									legal@bibisfarm.com
								</a>
							</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
							</svg>
							<span class="text-gray-700">
								Privacy concerns: 
								<a href="mailto:privacy@bibisfarm.com" class="text-orange-600 hover:text-orange-800 underline font-medium">
									privacy@bibisfarm.com
								</a>
							</span>
						</div>
					</div>
					<p class="text-sm text-gray-500 mt-4">
						We typically respond within 24-48 hours during business days.
					</p>
				</div>
			</div>

			<!-- Quick Links -->
			<div class="mt-8 flex flex-wrap gap-4 justify-center">
				<a href="/terms" class="px-6 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors">
					Terms of Service
				</a>
				<a href="/privacy" class="px-6 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors">
					Privacy Policy
				</a>
			</div>
		</div>
	</main>
</div>
