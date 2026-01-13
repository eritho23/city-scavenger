<script lang="ts">
	import type { Feature, LineString, MultiPolygon, Polygon } from "geojson";
	import type { LatLng } from "leaflet";
	import { onMount } from "svelte";
	import { SvelteSet } from "svelte/reactivity";
	import MapComponent from "$lib/components/map.svelte";
	import QuestionsCard from "$lib/components/QuestionsCard.svelte";
	import { VästeråsLatLng } from "$lib/constants/coords.js";
	import {
		airportLocations,
		svartanLineFeature,
	} from "$lib/constants/geography";
	import {
		type BoundaryResult,
		intersectBoundaries,
		type QuestionAnswer,
		type RadarQuestionKey,
		type RelativeQuestionKey,
		updateBoundary,
	} from "$lib/mapFunctions";
	import { RadarQuestions } from "$lib/questions/radars";
	import { RelativeKey } from "$lib/questions/relative";
	import { currentGame } from "$lib/stores/game.svelte.js";

	let { data } = $props();

	let score = $state(0);
	let time = $state("00:00:00");

	let currentPosition: LatLng = $state(VästeråsLatLng);

	// Track the current search boundary based on answered questions
	let currentBoundary: Feature<Polygon | MultiPolygon> | null = $state(null);
	// Store all answered boundaries to intersect
	let answeredBoundaries: Feature<Polygon | MultiPolygon>[] = $state([]);
	// Track divider lines (used for latitude/longitude questions)
	let boundaryLines: Feature<LineString>[] = $state([]);

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

	// Question type indices
	const questionTypeMap: Record<string, number> = {
		relative: 0,
		photo: 1,
		radar: 2,
		oddball: 3,
		precision: 4,
	};

	// Maps for converting questionIds to indices
	const radarQuestionKeys = Object.keys(RadarQuestions);
	const relativeOrder = [
		RelativeKey.Longitude,
		RelativeKey.Latitude,
		RelativeKey.RailwayDistance,
		RelativeKey.SvartanDistance,
		RelativeKey.SameAirport,
	];

	function getQuestionIndex(
		questionType: string,
		questionId: string,
	): number | null {
		if (questionType === "radar") {
			return radarQuestionKeys.indexOf(questionId);
		} else if (questionType === "relative") {
			return relativeOrder.indexOf(questionId as RelativeKey);
		}
		// For other types, questionId is already the index as string
		const idx = Number.parseInt(questionId, 10);
		return Number.isNaN(idx) ? null : idx;
	}

	// Initialize answered questions and answers from server data
	let answeredQuestions: Record<number, Set<number>> = $state({
		0: new SvelteSet(),
		1: new SvelteSet(),
		2: new SvelteSet(),
		3: new SvelteSet(),
		4: new SvelteSet(),
	});

	let initialQuestionAnswers: Record<string, string> = $state({});

	function computeBoundaryResult(
		playerLat: number,
		playerLng: number,
		questionAnswer: QuestionAnswer,
	) {
		return updateBoundary(
			playerLat,
			playerLng,
			questionAnswer,
			undefined,
			svartanLineFeature,
			airportLocations,
		);
	}

	function applyBoundaryResult(boundaryResult: BoundaryResult) {
		const newBoundaries = [...answeredBoundaries, boundaryResult.boundary];
		answeredBoundaries = newBoundaries;

		if (boundaryResult.dividerLine) {
			boundaryLines = [...boundaryLines, boundaryResult.dividerLine];
		}

		if (newBoundaries.length === 1) {
			currentBoundary = boundaryResult.boundary;
		} else {
			currentBoundary = intersectBoundaries(newBoundaries);
		}
	}

	// Load from server on mount
	onMount(() => {
		const answers = data.game.answers;
		if (Array.isArray(answers)) {
			let loadedQuestions = 0;

			for (const item of answers) {
				if (item && typeof item === "object" && !Array.isArray(item)) {
					const record = item as {
						questionType: string;
						questionId: string;
						answer: string;
						userPosition?: { lat: number; lng: number };
					};
					const typeIndex = questionTypeMap[record.questionType];
					if (typeIndex !== undefined) {
						const questionIndex = getQuestionIndex(
							record.questionType,
							record.questionId,
						);
						if (questionIndex !== null && questionIndex >= 0) {
							answeredQuestions[typeIndex].add(questionIndex);
							const key = `${typeIndex}-${questionIndex}`;
							initialQuestionAnswers[key] = record.answer;
							loadedQuestions++;

							const playerLatForAnswer =
								record.userPosition?.lat ?? currentPosition.lat;
							const playerLngForAnswer =
								record.userPosition?.lng ?? currentPosition.lng;

							// Rebuild boundaries from saved radar/relative answers
							if (record.questionType === "radar") {
								const radarAnswer: QuestionAnswer = {
									category: "radar",
									key: record.questionId as RadarQuestionKey,
									answer: record.answer === "true",
								};
								const boundaryResult = computeBoundaryResult(
									playerLatForAnswer,
									playerLngForAnswer,
									radarAnswer,
								);
								applyBoundaryResult(boundaryResult);
							} else if (record.questionType === "relative") {
								const relativeKey = record.questionId as RelativeQuestionKey;
								let relativeAnswer:
									| "higher"
									| "lower"
									| "closer"
									| "farther"
									| "yes"
									| "no";
								if (
									relativeKey === "relative-longitude" ||
									relativeKey === "relative-latitude"
								) {
									relativeAnswer =
										record.answer === "true" ? "higher" : "lower";
								} else if (
									relativeKey === "distance-railway" ||
									relativeKey === "distance-svartan"
								) {
									relativeAnswer =
										record.answer === "true" ? "closer" : "farther";
								} else {
									relativeAnswer = record.answer === "true" ? "yes" : "no";
								}
								const questionAnswer: QuestionAnswer = {
									category: "relative",
									key: relativeKey,
									answer: relativeAnswer,
								};
								const boundaryResult = computeBoundaryResult(
									playerLatForAnswer,
									playerLngForAnswer,
									questionAnswer,
								);
								applyBoundaryResult(boundaryResult);
							}
						}
					}
				}
			}
			// Initialize score based on already-answered questions
			score = loadedQuestions * 30;
		}
	});

	let currentType = $state(0);

	function handleQuestionAnswered(
		type: number,
		questionIndex: number,
		questionId: string,
		answer: string,
	) {
		answeredQuestions[type].add(questionIndex);

		// Handle boundary updates for radar and relative questions
		const questionTypeName = Object.keys(questionTypeMap).find(
			(k) => questionTypeMap[k] === type,
		);

		if (questionTypeName === "radar") {
			// Create a QuestionAnswer for radar type
			const radarAnswer: QuestionAnswer = {
				category: "radar",
				key: questionId as RadarQuestionKey,
				answer: answer === "true",
			};

			const boundaryResult = computeBoundaryResult(
				currentPosition.lat,
				currentPosition.lng,
				radarAnswer,
			);
			applyBoundaryResult(boundaryResult);
		} else if (questionTypeName === "relative") {
			// Handle relative questions (latitude/longitude)
			const relativeKey = questionId as RelativeQuestionKey;

			// Map the answer to the expected format
			let relativeAnswer:
				| "higher"
				| "lower"
				| "closer"
				| "farther"
				| "yes"
				| "no";
			if (
				relativeKey === "relative-longitude" ||
				relativeKey === "relative-latitude"
			) {
				relativeAnswer = answer === "true" ? "higher" : "lower";
			} else if (
				relativeKey === "distance-railway" ||
				relativeKey === "distance-svartan"
			) {
				relativeAnswer = answer === "true" ? "closer" : "farther";
			} else if (relativeKey === "same-airport") {
				relativeAnswer = answer === "true" ? "yes" : "no";
			} else {
				relativeAnswer = answer === "true" ? "yes" : "no";
			}

			const questionAnswer: QuestionAnswer = {
				category: "relative",
				key: relativeKey,
				answer: relativeAnswer,
			};

			const boundaryResult = computeBoundaryResult(
				currentPosition.lat,
				currentPosition.lng,
				questionAnswer,
			);

			applyBoundaryResult(boundaryResult);
		}

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
	class="absolute z-0 pointer-events-none w-full h-[20%] bottom-0 left-0 bg-linear-to-t from-40% from-bg-900 to-transparent"
></div>
<div class="w-full h-full absolute top-0 left-0 -z-10">
	<MapComponent
		positionCallback={handlePositionUpdate}
		boundary={currentBoundary}
		{boundaryLines}
		showBoundaryLines={false}
		boundaryStyle={{
			fillColor: "#1f2937",
			color: "#374151",
			fillOpacity: 0.2,
			weight: 1,
		}}
	/>
</div>
<div class="fixed bottom-3 left-0 px-3 w-full z-30">
	<QuestionsCard
		bind:currentType
		bind:answeredQuestions
		questionAnswerCallback={handleQuestionAnswered}
		scoreChange=""
		currentPosition={{ lat: currentPosition.lat, lng: currentPosition.lng }}
		initialAnswers={initialQuestionAnswers}
	/>
</div>
