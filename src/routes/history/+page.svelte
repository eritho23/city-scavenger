<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import { resolve } from "$app/paths";

	let { data } = $props();
	let score = 0;
	let time = "--:--:--";

	function fmt(iso: string) {
		const d = new Date(iso);
		const date = d.toLocaleDateString(undefined, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		const time = d.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
		});
		return { date, time };
	};
</script>

<div class="min-h-screen bg-linear-to-b from-blue-50 to-white">
	<Header {score} {time} onMenuClick={() => {}} />

	<div class="px-5 py-6">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Historik</h1>

			<p class="text-sm text-gray-600">Dina tidigare spelomgångar</p>
		</div>

		<div class="space-y-3">
			{#if data?.games?.length}
				{#each data.games as game, i (game.uid)}
					{#key game.uid}
						<a
							href={resolve("/game/[gameId]", { gameId: game.uid })}
							class="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300"
							style="animation-delay: {i * 50}ms"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-900">
										{i + 1}
									</div>
									<div>
										<p class="font-semibold text-gray-900">Game {game.uid}</p>
										{#if game.started_at}
											{@const f = fmt(game.started_at.toISOString())}
											<p class="text-xs text-gray-500">{f.date} • {f.time}</p>
										{/if}
									</div>
								</div>
								<div class="text-right">
									<p class="text-xs text-gray-500">{game.ended_at ? "Finished" : "Active"}</p>
								</div>
							</div>
						</a>
					{/key}
				{/each}
			{:else}
				<p class="text-gray-600">Inga tidigare spel hittades.</p>
			{/if}
		</div>

        
	</div>
</div>

<style>
	@keyframes slideInFromBottom {
		from {
			opacity: 0;

			transform: translateY(8px);
		}

		to {
			opacity: 1;

			transform: translateY(0);
		}
	}

	:global(.animate-in) {
		animation: slideInFromBottom 300ms ease-out forwards;
	}

	:global(.fade-in) {
		opacity: 0;
	}
</style>
