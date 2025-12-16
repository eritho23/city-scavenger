<script lang="ts">
	import Header from "$lib/components/Header.svelte";

	let score = 245;

	let time = "12:34:56";

	const rounds = [
		{ id: 0, round: 1, score: 150, date: "2025-11-26", time: "12:34" },

		{ id: 1, round: 2, score: 95, date: "2025-11-25", time: "08:45" },

		{ id: 2, round: 3, score: 120, date: "2025-11-24", time: "15:20" },
	];
</script>

<div class="min-h-screen bg-linear-to-b from-blue-50 to-white">
	<Header {score} {time} onMenuClick={() => {}} />

	<div class="px-5 py-6">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Historik</h1>

			<p class="text-sm text-gray-600">Din tidigare spelomgångar</p>
		</div>

		<div class="space-y-3">
			{#each rounds as round, i (round.id)}
				<div
					class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300"
					style="animation-delay: {i * 50}ms"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div
								class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center font-bold text-blue-900"
							>
								{round.round}
							</div>

							<div>
								<p class="font-semibold text-gray-900">Omgång {round.round}</p>

								<p class="text-xs text-gray-500">{round.date} • {round.time}</p>
							</div>
						</div>

						<div class="text-right">
							<p class="text-2xl font-bold text-blue-600">{round.score}</p>

							<p class="text-xs text-gray-500">poäng</p>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
			<p class="text-sm text-gray-700 mb-2">Totalt samlat</p>

			<p class="text-4xl font-bold text-blue-900">
				{rounds.reduce((sum, r) => sum + r.score, 0)} poäng
			</p>
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
