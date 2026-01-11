<script lang="ts">
	import { Loader } from "@lucide/svelte";
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";

	let isLoading = $state(false);
</script>

<div class="min-h-screen bg-white">
	<div class="container mx-auto px-6 py-12">
		<div class="mb-12">
			<h1 class="text-5xl font-bold mb-2 text-gray-900">City Scavenger</h1>
		</div>

		<div class="flex flex-col gap-4">
			<form method="POST" action="?/createGame" use:enhance={() => {
				isLoading = true;
			}}>
				<button
					type="submit"
					disabled={isLoading}
					class="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
				>
					{#if isLoading}
						<Loader class="animate-spin" size={20} />
						<span>Startar spel...</span>
					{:else}
						<span>Starta nytt spel</span>
					{/if}
				</button>
			</form>

			<a
				href={resolve("/history")}
				class="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-center"
			>
				Spelhistorik
			</a>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	}
</style>
