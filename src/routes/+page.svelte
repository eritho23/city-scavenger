<script lang="ts">
	import { ChevronDown, Loader, Minus, Plus } from "@lucide/svelte";
	import { onDestroy, onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { enhance } from "$app/forms";

	import iconBg from "$lib/assets/bg-scav-icon.svg";

	import HDivider from "$lib/components/HDivider.svelte";

	let isLoading = $state(false);

	let mockstats = $state([
		{
			stat: "Totalpoäng",
			value: 720,
		},
		{
			stat: "Spelade rundor",
			value: 34,
		},
		{
			stat: "Kortaste tid",
			value: "00:06:24",
		},
	]);

	const gamedatamock = [
		25,
		25,
		50,
		120,
		30,
		5,
		null,
		null,
		null,
		150,
		null,
		40,
		25,
		0,
		90,
		100,
		-10,
		null,
		null,
		0,
		80,
		70,
		10,
		-40,
		40,
		60,
		0,
		10,
		15,
	];

	let statInterval: ReturnType<typeof setInterval>;
	const ROTATE_MS = 4000;

	onMount(() => {
		statInterval = setInterval(() => {
			// move last to first (this triggers flip animation)
			mockstats = [mockstats[mockstats.length - 1], ...mockstats.slice(0, mockstats.length - 1)];
		}, ROTATE_MS);
	});

	onDestroy(() => clearInterval(statInterval));
</script>

<svelte:head>
	<title>cityscav</title>
</svelte:head>

<div class="overflow-x-hidden pt-36 mx-auto">
	<div class="relative">
		<form
			class="absolute inset-0 top-32 w-[80%] mx-auto"
			method="POST"
			action="?/createGame"
			use:enhance={() => {
				isLoading = true;
			}}
		>
			<button
				type="submit"
				disabled={isLoading}
				class="w-full h-10 bg-primary text-white font-semibold rounded-3xl disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
			>
				{#if isLoading}
					<Loader class="animate-spin" size={20} />
					<span>Startar spel...</span>
				{:else}
					<span>Ny runda</span>
					<Plus size={18} />
				{/if}
			</button>
		</form>
		<img src={iconBg} alt="" class="mx-auto" />
	</div>
	<section class="absolute overflow-x-hidden bottom-3 w-[calc(100%-2*12px)]">
		<div class="relative">
			<div
				class="absolute z-10 top-0 right-0 bg-linear-to-l from-bg-900 to-bg-transparent w-[15%] h-full"
			></div>
			<div class="pl-3 flex flex-row mb-6">
				{#each mockstats as stat, i (stat.stat)}
					<p
						animate:flip={{ duration: 700, easing: cubicOut }}
						class="min-w-max px-3 py-0.5 rounded transition-opacity duration-500 select-none"
						style="opacity: {i < 2 ? 1 : 0.28};"
					>
						<span class="text-text-200">{stat.stat}:</span>
						{stat.value}
					</p>
				{/each}
			</div>
		</div>
		<article
			class="bg-bg-100 text-bg-900 selection:bg-bg-900! selection:text-text-100! rounded-3xl px-6 py-4 text-sm"
		>
			<div class="text-text-150 flex gap-2 items-center mb-8">
				<span>Svit</span>
				<HDivider class="bg-bg-300! w-4!" />
				<div class="*:inline-block cursor-pointer">
					<span>Senaste 30 dagarna</span>
					<ChevronDown size={18} class="stroke-text-200" />
				</div>
			</div>
			<div class="w-[90%] mx-auto flex flex-wrap gap-x-3 gap-y-1 mb-6">
				{#each gamedatamock as gameScore, index (index)}
					{#if gameScore == null}
						<Minus size={24} />
					{:else}
						<span>
							{gameScore > 0 ? "+" : ""}{gameScore}
						</span>
					{/if}
				{/each}
			</div>
		</article>
	</section>
</div>
