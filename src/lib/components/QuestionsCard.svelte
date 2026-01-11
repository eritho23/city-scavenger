<script lang="ts">
	import { ChevronLeft, ChevronRight } from "@lucide/svelte";

	import { RadarQuestions } from "$lib/questions/radars";
	import { RelativeKey, RelativeQuestions } from "$lib/questions/relative";

	interface Props {
		scoreChange: string;
		currentType: number;
		answeredQuestions: Record<number, Set<number>>;
		questionAnswerCallback: (type: number, questionIndex: number) => void;
	}

	const relativeOrder = [
		RelativeKey.Longitude,
		RelativeKey.Latitude,
		RelativeKey.RailwayDistance,
		RelativeKey.SvartanDistance,
		RelativeKey.SameAirport,
	] as const;

	const relativeQuestionsFromConfig: Question[] = relativeOrder.map((key) => {
		const rq = RelativeQuestions[key];
		let a: string;
		switch (key) {
			case RelativeKey.Longitude:
				a = "Högre eller lägre longitud";
				break;
			case RelativeKey.Latitude:
				a = "Högre eller lägre latitud";
				break;
			case RelativeKey.RailwayDistance:
				a = "Närmare eller längre från järnvägen";
				break;
			case RelativeKey.SvartanDistance:
				a = "Närmare eller längre från Svartån";
				break;
			case RelativeKey.SameAirport:
				a = "Ja, samma flygplats / Nej, olika";
				break;
		}
		return { q: rq.prompt, a };
	});

	let {
		scoreChange = "+ 30 poäng",
		currentType = $bindable(0),
		answeredQuestions = $bindable({
			0: new Set(),
			1: new Set(),
			2: new Set(),
			3: new Set(),
			4: new Set(),
		}),
		questionAnswerCallback,
	}: Props = $props();

	type Question = {
		q: string;
		a: string;
	};

	const radarQuestionsFromConfig: Question[] = Object.values(RadarQuestions).map((rq) => ({
		q: `Är målpunkten inom ${rq.displayName} från mig?`,
		a: `Radargräns: ${rq.range} km`,
	}));

	type QuestionType = {
		name: string;
		bg: string;
		secondButton: string;
		mainText: string;
		secondText: string;
		thirdText: string;
		questions: Question[];
	};

	const questionTypes: QuestionType[] = [
		{
			name: "Relativ",
			bg: "bg-card-blue-900",
			// button: "bg-card-blue-700",
			secondButton: "bg-card-blue-800",
			mainText: "text-card-blue-100",
			secondText: "text-card-blue-200",
			thirdText: "text-card-blue-300",
			questions: relativeQuestionsFromConfig,
		},
		{
			name: "Foton",
			bg: "bg-card-green-900",
			secondButton: "bg-card-green-800",
			mainText: "text-card-green-100",
			secondText: "text-card-green-200",
			thirdText: "text-card-green-300",
			questions: [
				{
					q: "Vilket foto är från detta område?",
					a: "Det första fotot (överst till vänster)",
				},
				{
					q: "Identifiera byggnaden på bilden",
					a: "Gamla postkontoret från 1920",
				},
				{ q: "Var togs detta foto?", a: "Från Västra Torggatan" },
				{
					q: "Vilken fasad tillhör denna byggnad?",
					a: "Huvudfasaden mot väster",
				},
				{ q: "Från vilket håll togs bilden?", a: "Från söder" },
				{ q: "Vilken tid på dagen?", a: "Förmiddag (solljus från öster)" },
				{ q: "Vilken säsong var det?", a: "Sommaren" },
				{ q: "Vem byggde detta?", a: "Arkitekt Erik Ahlström" },
				{ q: "Vilket material är använt?", a: "Röd tegelsten" },
				{ q: "Hur gammalt är byggnaden?", a: "Cirka 100 år" },
				{ q: "Vilket arkitektur stil?", a: "Nationalromantik" },
				{ q: "Vad är syftet med byggnaden?", a: "Kontorsbyggnad" },
			],
		},
		{
			name: "Radar",
			bg: "bg-card-red-900",
			secondButton: "bg-card-red-800",
			mainText: "text-card-red-100",
			secondText: "text-card-red-200",
			thirdText: "text-card-red-300",
			questions: radarQuestionsFromConfig,
		},
		{
			name: "Oddball",
			bg: "bg-card-purple-900",
			secondButton: "bg-card-purple-800",
			mainText: "text-card-purple-100",
			secondText: "text-card-purple-200",
			thirdText: "text-card-purple-300",
			questions: [
				{ q: "Hitta det udda objektet", a: "Det röda huset (övriga är blå)" },
				{ q: "Vilket passar inte in?", a: "Bilen (övriga är människor)" },
				{
					q: "Vilken är annorlunda?",
					a: "Cykeln (övriga är fordon med motor)",
				},
				{
					q: "Vilket tillhör inte gruppen?",
					a: "Trädet (övriga är byggnader)",
				},
				{
					q: "Vilket är det felaktigaste?",
					a: "Det gula skylten (övriga är vita)",
				},
				{
					q: "Vad bryter mönstret?",
					a: "Den moderna byggnaden (övriga är gamla)",
				},
				{ q: "Vilket är från en annan tid?", a: "Bilen från 1960-talet" },
				{
					q: "Vad är överflödigt?",
					a: "Affischen (den är inte originalbyggnaden)",
				},
				{ q: "Vilket material sticker ut?", a: "Glasfasaden (övriga är sten)" },
				{ q: "Vilken färg passar inte?", a: "Grön (övriga är i varma färger)" },
				{
					q: "Vilket är från annan byggnad?",
					a: "Dörren från andra sidan vägen",
				},
				{ q: "Vad är det främmande objektet?", a: "Graffitit på väggen" },
			],
		},
		{
			name: "Precision",
			bg: "bg-card-yellow-900",
			secondButton: "bg-card-yellow-800",
			mainText: "text-card-yellow-100",
			secondText: "text-card-yellow-200",
			thirdText: "text-card-yellow-300",
			questions: [
				{ q: "Peka på exakt plats på kartan", a: "59.3293°N, 16.5411°E" },
				{
					q: "Markera den exakta positionen",
					a: "Vid huvudingången på västra sidan",
				},
				{ q: "Var är du med säkerhet?", a: "Västra Torggatan 12" },
				{ q: "Närmsta punkt på denna väg?", a: "Vid trafikljusen" },
				{ q: "Vilken adress är detta?", a: "Västra Torggatan 12, Västerås" },
				{ q: "Exakta GPS-koordinater?", a: "59°19'45.4\"N 16°32'27.9\"E" },
				{ q: "Vilken intersection?", a: "Västra Torggatan & Slottsvägen" },
				{ q: "Vilken byggnad är detta?", a: "Gamla Stadsbiblioteket" },
				{ q: "Närmare precisering krävs", a: "Framför huvuddörren" },
				{ q: "Vad är det exakta stället?", a: "Torgplatsen mittemot fontänen" },
				{ q: "Vilket husnummer?", a: "Nummer 15" },
				{ q: "Vilken gata är detta på?", a: "Västra Torggatan" },
			],
		},
	];

	let selectedQuestion = $state(0);

	// Swipe handling
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let touchEndX = $state(0);
	let touchEndY = $state(0);

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
		touchStartY = e.changedTouches[0].screenY;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		touchEndY = e.changedTouches[0].screenY;
		handleSwipe();
	}

	function handleSwipe() {
		const diffX = touchStartX - touchEndX;
		const diffY = touchStartY - touchEndY;
		const minSwipeDistance = 50;

		// Determine if swipe is more horizontal or vertical
		if (Math.abs(diffX) > Math.abs(diffY)) {
			// Horizontal swipe (between questions)
			if (Math.abs(diffX) > minSwipeDistance) {
				if (diffX > 0) {
					nextQuestion();
				} else {
					prevQuestion();
				}
			}
		} else {
			// Vertical swipe (between sections)
			if (Math.abs(diffY) > minSwipeDistance) {
				if (diffY > 0) {
					nextType();
				} else {
					prevType();
				}
			}
		}
	}

	function nextQuestion() {
		if (selectedQuestion < current.questions.length - 1) {
			selectedQuestion++;
		}
	}

	function prevQuestion() {
		if (selectedQuestion > 0) {
			selectedQuestion--;
		}
	}

	function nextType() {
		selectedQuestion = 0;
		currentType = (currentType + 1) % questionTypes.length;
	}

	function prevType() {
		selectedQuestion = 0;
		currentType = (currentType - 1 + questionTypes.length) % questionTypes.length;
	}

	function submitAnswer() {
		if (!isAnswered) {
			answeredQuestions[currentType].add(selectedQuestion);
			answeredQuestions = { ...answeredQuestions };
			questionAnswerCallback(currentType, selectedQuestion);
		}
	}

	let current = $derived(questionTypes[currentType]);
	let currentQuestion = $derived(current.questions[selectedQuestion]);
	let isAnswered = $derived(answeredQuestions[currentType].has(selectedQuestion));
	let nextType1 = $derived(questionTypes[(currentType + 1) % questionTypes.length]);
	let nextType2 = $derived(questionTypes[(currentType + 2) % questionTypes.length]);

	// Hold animation
	let isHolding = $state(false);
	let animationCompleted = $state(false);

	function startHold() {
		if (isAnswered) return;
		isHolding = true;
		animationCompleted = false;
	}

	function endHold() {
		if (!isHolding) return;

		if (animationCompleted) {
			submitAnswer();
		}

		isHolding = false;
		animationCompleted = false;
	}

	function handleTransitionEnd(event: TransitionEvent) {
		if (event.propertyName === "width" && isHolding) {
			animationCompleted = true;
			submitAnswer();
			isHolding = false;
		}
	}
</script>

<div class="relative mb-3">
	<div
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		class="transition-colors rounded-3xl duration-300 ease-out {current.bg} {current.mainText} px-8 py-4 transform relative z-30 bg-clip-padding"
	>
		<div class="flex justify-between items-center mb-4">
			<div class="text-sm flex gap-2">
				<span class={current.secondText}>{current.name}</span>
				<span class={current.thirdText}
					>{currentType + 1}/{questionTypes.length}</span
				>
			</div>
			<span class="text-sm {current.secondText}">{scoreChange}</span>
		</div>

		<div class="h-26">
			{#if !isAnswered}
				<button
					class="relative overflow-hidden w-full"
					onmousedown={startHold}
					onmouseup={endHold}
					onmouseleave={endHold}
					ontouchstart={startHold}
					ontouchend={endHold}
					ontouchcancel={endHold}
					disabled={isAnswered}
				>
					<div
						class="absolute inset-0 origin-left rounded-l-3xl rounded-r-sm {current.secondButton} z-0"
						style="width: {isHolding
							? '100%'
							: '0.5rem'}; transition: width {isHolding
							? '1.6s'
							: '0.3s'} {isHolding ? 'linear' : 'ease-out'};"
						ontransitionend={handleTransitionEnd}
					></div>

					<div class="py-3 px-6 relative">
						<p class="mb-2 text-left leading-tight">
							<span>{currentQuestion.q}</span>
						</p>
					</div>
				</button>
			{:else}
				<div class="pt-1 *:leading-tight px-3">
					<p class="mb-3">{currentQuestion.a}</p>
					<p class="text-sm {current.secondText}">{currentQuestion.q}</p>
				</div>
			{/if}
		</div>

		<div class="flex justify-between items-center mb-1">
			<div></div>
			<div class="flex gap-1 items-center">
				<button
					onclick={prevQuestion}
					disabled={selectedQuestion === 0}
					class="disabled:opacity-30"
				>
					<ChevronLeft size={14} class={current.thirdText} />
				</button>
				<span class="text-sm {current.thirdText}"
					>{selectedQuestion + 1}/{current.questions.length}</span
				>
				<button
					onclick={nextQuestion}
					disabled={selectedQuestion === current.questions.length - 1}
					class="disabled:opacity-30"
				>
					<ChevronRight size={14} class={current.thirdText} />
				</button>
			</div>
		</div>
	</div>
	<div
		class="absolute inset-x-1 top-4 h-[calc(100%-0.5rem)] z-20 rounded-3xl transition-all duration-500 ease-out {nextType1.bg}"
	></div>
	<div
		class="absolute inset-x-2 top-8 h-[calc(100%-1rem)] z-10 rounded-3xl transition-all duration-500 ease-out {nextType2.bg}"
	></div>
</div>
