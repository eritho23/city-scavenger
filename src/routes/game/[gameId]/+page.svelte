<script lang="ts">
	import { onMount } from "svelte";
	import { SvelteSet } from "svelte/reactivity";
	import Header from "$lib/components/Header.svelte";
	import MapPlaceholder from "$lib/components/MapPlaceholder.svelte";
	import QuestionsCard from "$lib/components/QuestionsCard.svelte";

	let { data } = $props();

	let score = $state(0);
	let time = $state("00:00:00");

	onMount(() => {
		const updateTime = () => {
			const now = new Date();
			const startedAt = new Date(data.game.started_at);
			const totalSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor((totalSeconds % 3600) / 60);
			const seconds = totalSeconds % 60;
			time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	});

	let currentType = $state(0);
	let answeredQuestions: Record<number, Set<number>> = $state({
		0: new SvelteSet(),
		1: new SvelteSet(),
		2: new SvelteSet(),
		3: new SvelteSet(),
		4: new SvelteSet(),
	});

	function handleQuestionAnswered(type: number, questionIndex: number) {
		answeredQuestions[type].add(questionIndex);

		// Add points with animation
		animatePoints(30);
	}

	function animatePoints(points: number) {
		const startScore = score;
		const targetScore = score + points;
		const duration = 900; // milliseconds
		const start = Date.now();

		const animate = () => {
			const elapsed = Date.now() - start;
			const progress = Math.min(elapsed / duration, 1);
			score = Math.floor(startScore + points * progress);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				score = targetScore;
			}
		};

		requestAnimationFrame(animate);
	}
</script>

<div class="min-h-screen bg-white">
	<Header {score} {time} onMenuClick={() => {}}/>
	<div class="w-full">
		<MapPlaceholder />
	</div>
	<div class="px-5 py-5">
		<QuestionsCard
			bind:currentType
			bind:answeredQuestions
			questionAnswerCallback={handleQuestionAnswered}
			scoreChange=""
		/>
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
