<script lang="ts">
	import { enhance } from "$app/forms";
	import {resolve} from "$app/paths";
    import { Loader } from "@lucide/svelte";


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
			<div class="flex flex-row">
				{#if isLoading}
					<Loader class="animate-spin" />	
					<span>Laddar</span>
				{:else}
					<span>Nytt spel</span>
				{/if}
			</div>
			</button>
		</form>

		<a
			href={resolve("/history")}
			class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 inline-block"
		>
			Historik
		</a>
	</nav>
</div>
