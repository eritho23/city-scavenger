<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import MapPlaceholder from "$lib/components/MapPlaceholder.svelte";
	import QuestionsCard from "$lib/components/QuestionsCard.svelte";

	let score = 0;
	let time = "00:12:24";
	let currentType = 0;
	let answeredQuestions: Record<number, Set<number>> = {
		0: new Set(),
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set(),
	};

	function handleDotClick(index: number) {
		currentType = index;
	}

	function handleQuestionAnswered(
		event: CustomEvent<{ type: number; questionIndex: number }>,
	) {
		const { type, questionIndex } = event.detail;
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

<div class="min-h-screen bg-white">
	<Header {score} {time} />
	<div class="w-full">
		<!-- <MapPlaceholder {currentType} onDotClick={handleDotClick} /> -->
		<MapPlaceholder />
	</div>
	<div class="px-5 py-5">
		<QuestionsCard
			bind:currentType
			bind:answeredQuestions
			on:questionAnswered={handleQuestionAnswered}
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
