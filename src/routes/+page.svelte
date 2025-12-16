<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";

	export let data;
	let isLoading = false;

	const handleCreateGame = () => {
		isLoading = true;
		return async ({ result }) => {
			if (result.type === "success" && result.data.gameId) {
				await goto(`/game/${result.data.gameId}`);
			}
			isLoading = false;
		};
	};
</script>

<div class="container mx-auto p-8">
	<h1 class="text-4xl font-bold mb-8">City Scavenger</h1>

	<nav class="flex gap-4 mb-12">
		<form method="POST" action="?/createGame" use:enhance={handleCreateGame}>
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

	{#if data.games && data.games.length > 0}
		<div>
			<h2 class="text-2xl font-semibold mb-4">Your Games</h2>
			<ul class="space-y-2">
				{#each data.games as game (game.uid)}
					<li class="p-4 border rounded">
						<a href="/game/{game.uid}" class="text-blue-500 hover:underline">
							Game {game.uid}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
