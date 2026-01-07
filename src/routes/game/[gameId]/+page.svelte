<script lang="ts">
	import Map from "$lib/components/map.svelte";
	import QuestionsCard from "$lib/components/QuestionsCard.svelte";

	import { currentGame } from "$lib/stores/game.svelte.js";

	import { onMount } from "svelte";

	let { data } = $props();

	let score = $state(0);
	let time = $state("00:00:00");

	$effect(() => {
		currentGame.score = score;
		currentGame.time = time;
	});

	onMount(() => {
		const updateTime = () => {
			const now = new Date();
			const startedAt = new Date(data.game.started_at);
			const totalSeconds = Math.floor(
				(now.getTime() - startedAt.getTime()) / 1000,
			);
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
		0: new Set(),
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set(),
	});

	function handleQuestionAnswered(type: number, questionIndex: number) {
		answeredQuestions[type].add(questionIndex);
		answeredQuestions = answeredQuestions;

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
	<Map />
</div>
<div class="fixed bottom-3 left-0 px-3 w-full">
	<QuestionsCard
		bind:currentType
		bind:answeredQuestions
		questionAnswerCallback={handleQuestionAnswered}
		scoreChange=""
	/>
</div>
