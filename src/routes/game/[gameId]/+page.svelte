<script lang="ts">
	import type { LatLng } from "leaflet";
	import { onMount } from "svelte";
	import { SvelteSet } from "svelte/reactivity";
	import { browser, dev } from "$app/environment";
	import MapComponent from "$lib/components/map.svelte";

	import QuestionsCard from "$lib/components/QuestionsCard.svelte";
	import { VästeråsLatLng } from "$lib/constants/coords.js";
	import { currentGame } from "$lib/stores/game.svelte.js";

	let { data } = $props();

	let score = $state(0);
	let time = $state("00:00:00");

	let currentPosition: LatLng | undefined = $state();

	function handlePositionUpdate(pos: LatLng) {
		currentPosition = pos;
	}

	$effect(() => {
		currentGame.score = score;
		currentGame.time = time;
	});

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

<div
	class="absolute w-full h-[20%] bottom-0 left-0 bg-linear-to-t from-40% from-bg-900 to-transparent"
></div>
<div class="w-full h-full absolute top-0 left-0 -z-10">
	<MapComponent positionCallback={handlePositionUpdate} />
</div>
<div class="fixed bottom-3 left-0 px-3 w-full">
	<QuestionsCard
		bind:currentType
		bind:answeredQuestions
		questionAnswerCallback={handleQuestionAnswered}
		scoreChange=""
	/>
</div>
