<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";

	let isLoading = $state(false);
</script>

<div class="container mx-auto p-8">
	<h1 class="text-4xl font-bold mb-8">City Scavenger</h1>

	<nav class="flex gap-4 mb-12">
		<form method="POST" action="?/createGame" use:enhance={() => {
			isLoading = true;
		}}>
			<button
				type="submit"
				disabled={isLoading}
				class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
			>
				{isLoading ? "Creating..." : "New Game"}
			</button>
		</form>

		<a
			href="/history"
			class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 inline-block"
		>
			History
		</a>
	</nav>
</div>
