<script lang="ts">
	import { resolve } from "$app/paths";

	let { data } = $props();

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
	}
</script>

<div class="overflow-x-hidden pt-32 mx-auto">
	<p class="mb-4 px-3">Tidigare rundor</p>

	{#if data?.games?.length}
		{#each data.games as game, i (game.uid)}
			{#key game.uid}
				<a
					href={resolve("/game/[gameId]", { gameId: game.uid })}
					class={`block ${game.ended_at ? "bg-bg-800" : "bg-bg-100 text-bg-900"} rounded-3xl p-8 animate-in fade-in duration-300`}
					style="animation-delay: {i * 50}ms"
				>
					<div class="flex items-center justify-between">
						<span class="font-semibold text-2xl">+90</span>
						<!-- ADD SCORE HERE, if active: current score, ended? final score -->
						<div class="pr-2">
							<div>
								<!-- <p>{game.uid}</p> -->
								{#if game.started_at}
									{@const f = fmt(game.started_at.toISOString())}
									<p>
										{f.date} <span class="text-text-200">•</span>
										{f.time}
									</p>
								{:else}
									well well well
								{/if}
							</div>
							<p class="text-sm text-text-200">
								{game.ended_at ? "Vunnen" : "Aktiv"}
							</p>
						</div>
					</div>
				</a>
			{/key}
		{/each}
	{:else}
		<p class="text-text-200 px-3">
			Inga tidigare spel hittades. Skapa en ny runda <a
				href={resolve("/")}
				class="underline">här</a
			>
		</p>
	{/if}
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
