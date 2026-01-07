<script lang="ts">
	interface Props {
		scoreChange: string;
		currentType: number;
		answeredQuestions: Record<number, Set<number>>;
		questionAnswerCallback: (type: number, questionIndex: number) => void;
	}

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

	type QuestionType = {
		name: string;
		bg: string;
		button: string;
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
			button: "bg-card-blue-700",
			secondButton: "bg-card-blue-800",
			mainText: "text-card-blue-100",
			secondText: "text-card-blue-200",
			thirdText: "text-card-blue-300",
			questions: [
				{
					q: "Är du närmare eller längre ifrån Burger King Västerås än mig?",
					a: "Längre ifrån",
				},
				{ q: "Vilken väg är kortast?", a: "Österledenvägen" },
				{ q: "Ligger platsen norr eller söder om här?", a: "Norr" },
				{ q: "Är detta objekt väster om dig?", a: "Ja" },
				{ q: "Hur många kvarter bort är det?", a: "Ungefär 3 kvarter" },
				{ q: "Är du närmare eller längre bort?", a: "Närmare" },
				{ q: "I vilken riktning ligger målpunkten?", a: "Nordöst" },
				{ q: "Hur långt är det ungefär?", a: "500 meter" },
				{ q: "Ligger det till höger eller vänster?", a: "Till höger" },
				{ q: "Är platsen högt eller lågt belägen?", a: "Lågt belägen" },
				{ q: "Vilken sida av vägen?", a: "Östra sidan" },
				{ q: "Närmaste eller längsta punkt?", a: "Närmaste" },
			],
		},
		// {
		// 	name: "Foton",
		// 	icon: Camera,
		// 	color: "bg-yellow-100",
		// 	buttonColor: "bg-yellow-300",
		// 	accentColor: "text-yellow-900",
		// 	lightButtonColor: "bg-yellow-200",
		// 	questions: [
		// 		{
		// 			q: "Vilket foto är från detta område?",
		// 			a: "Det första fotot (överst till vänster)",
		// 		},
		// 		{
		// 			q: "Identifiera byggnaden på bilden",
		// 			a: "Gamla postkontoret från 1920",
		// 		},
		// 		{ q: "Var togs detta foto?", a: "Från Västra Torggatan" },
		// 		{
		// 			q: "Vilken fasad tillhör denna byggnad?",
		// 			a: "Huvudfasaden mot väster",
		// 		},
		// 		{ q: "Från vilket håll togs bilden?", a: "Från söder" },
		// 		{ q: "Vilken tid på dagen?", a: "Förmiddag (solljus från öster)" },
		// 		{ q: "Vilken säsong var det?", a: "Sommaren" },
		// 		{ q: "Vem byggde detta?", a: "Arkitekt Erik Ahlström" },
		// 		{ q: "Vilket material är använt?", a: "Röd tegelsten" },
		// 		{ q: "Hur gammalt är byggnaden?", a: "Cirka 100 år" },
		// 		{ q: "Vilket arkitektur stil?", a: "Nationalromantik" },
		// 		{ q: "Vad är syftet med byggnaden?", a: "Kontorsbyggnad" },
		// 	],
		// },
		// {
		// 	name: "Radar",
		// 	icon: Radar,
		// 	color: "bg-green-100",
		// 	buttonColor: "bg-green-300",
		// 	accentColor: "text-green-900",
		// 	lightButtonColor: "bg-green-200",
		// 	questions: [
		// 		{ q: "Hur långt bort är målpunkten?", a: "Ungefär 800 meter" },
		// 		{ q: "I vilken riktning ligger objektet?", a: "Nordväst" },
		// 		{ q: "Estimera avståndet", a: "Ca 600-700 meter" },
		// 		{ q: "Är det inom 100m?", a: "Nej" },
		// 		{ q: "Ungefär hur många meter?", a: "750 meter" },
		// 		{ q: "Är signalen stark eller svag?", a: "Medel styrka" },
		// 		{ q: "I vilken sektor är målpunkten?", a: "Nordvästlig sektor" },
		// 		{ q: "Närmare eller längre än 500m?", a: "Längre än 500m" },
		// 		{ q: "Vilken kompassriktning?", a: "315 grader (NW)" },
		// 		{ q: "Är målet synligt?", a: "Delvis synligt" },
		// 		{ q: "Hur många grader från norr?", a: "45 grader väst" },
		// 		{ q: "Är det rakt fram eller åt sidan?", a: "Åt vänster och bakåt" },
		// 	],
		// },
		// {
		// 	name: "Oddball",
		// 	icon: Dice5,
		// 	color: "bg-purple-100",
		// 	buttonColor: "bg-purple-300",
		// 	accentColor: "text-purple-900",
		// 	lightButtonColor: "bg-purple-200",
		// 	questions: [
		// 		{ q: "Hitta det udda objektet", a: "Det röda huset (övriga är blå)" },
		// 		{ q: "Vilket passar inte in?", a: "Bilen (övriga är människor)" },
		// 		{
		// 			q: "Vilken är annorlunda?",
		// 			a: "Cykeln (övriga är fordon med motor)",
		// 		},
		// 		{
		// 			q: "Vilket tillhör inte gruppen?",
		// 			a: "Trädet (övriga är byggnader)",
		// 		},
		// 		{
		// 			q: "Vilket är det felaktigaste?",
		// 			a: "Det gula skylten (övriga är vita)",
		// 		},
		// 		{
		// 			q: "Vad bryter mönstret?",
		// 			a: "Den moderna byggnaden (övriga är gamla)",
		// 		},
		// 		{ q: "Vilket är från en annan tid?", a: "Bilen från 1960-talet" },
		// 		{
		// 			q: "Vad är överflödigt?",
		// 			a: "Affischen (den är inte originalbyggnaden)",
		// 		},
		// 		{ q: "Vilket material sticker ut?", a: "Glasfasaden (övriga är sten)" },
		// 		{ q: "Vilken färg passar inte?", a: "Grön (övriga är i varma färger)" },
		// 		{
		// 			q: "Vilket är från annan byggnad?",
		// 			a: "Dörren från andra sidan vägen",
		// 		},
		// 		{ q: "Vad är det främmande objektet?", a: "Graffitit på väggen" },
		// 	],
		// },
		// {
		// 	name: "Precision",
		// 	icon: Target,
		// 	color: "bg-pink-100",
		// 	buttonColor: "bg-pink-300",
		// 	accentColor: "text-pink-900",
		// 	lightButtonColor: "bg-pink-200",
		// 	questions: [
		// 		{ q: "Peka på exakt plats på kartan", a: "59.3293°N, 16.5411°E" },
		// 		{
		// 			q: "Markera den exakta positionen",
		// 			a: "Vid huvudingången på västra sidan",
		// 		},
		// 		{ q: "Var är du med säkerhet?", a: "Västra Torggatan 12" },
		// 		{ q: "Närmsta punkt på denna väg?", a: "Vid trafikljusen" },
		// 		{ q: "Vilken adress är detta?", a: "Västra Torggatan 12, Västerås" },
		// 		{ q: "Exakta GPS-koordinater?", a: "59°19'45.4\"N 16°32'27.9\"E" },
		// 		{ q: "Vilken intersection?", a: "Västra Torggatan & Slottsvägen" },
		// 		{ q: "Vilken byggnad är detta?", a: "Gamla Stadsbiblioteket" },
		// 		{ q: "Närmare precisering krävs", a: "Framför huvuddörren" },
		// 		{ q: "Vad är det exakta stället?", a: "Torgplatsen mittemot fontänen" },
		// 		{ q: "Vilket husnummer?", a: "Nummer 15" },
		// 		{ q: "Vilken gata är detta på?", a: "Västra Torggatan" },
		// 	],
		// },
	];

	let isTransitioning = $state(false);
	let slideDirection = $state(0);
	let selectedQuestion = $state(0);

	function nextType() {
		if (isTransitioning) return;
		isTransitioning = true;
		slideDirection = 1;
		selectedQuestion = 0;
		setTimeout(() => {
			currentType = (currentType + 1) % questionTypes.length;
			slideDirection = 0;
			isTransitioning = false;
		}, 300);
	}

	function prevType() {
		if (isTransitioning) return;
		isTransitioning = true;
		slideDirection = -1;
		selectedQuestion = 0;
		setTimeout(() => {
			currentType =
				(currentType - 1 + questionTypes.length) % questionTypes.length;
			slideDirection = 0;
			isTransitioning = false;
		}, 300);
	}

	function selectQuestion(index: number) {
		selectedQuestion = index;
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
	let isAnswered = $derived(
		answeredQuestions[currentType].has(selectedQuestion),
	);

	// Hold animation
	let isHolding = $state(false);
	let buttonEl: HTMLElement;

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

<div
	class="transition-all rounded-3xl duration-300 ease-in-out {current.bg} {current.mainText} rounded-3xl px-8 py-4"
	style="opacity: {slideDirection === 0
		? 1
		: 0}; transform: translateX({slideDirection * 50}px);"
>
	<div class="flex justify-between items-center mb-3">
		<div class="text-sm flex gap-2">
			<span class={current.secondText}>{current.name}</span>
			<span class={current.thirdText}>1/6</span>
		</div>
		<span class="text-sm {current.secondText}">{scoreChange}</span>
	</div>

	{#if !isAnswered}
		<button
			bind:this={buttonEl}
			class="mb-6 relative overflow-hidden"
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
		<div class="pt-1 mb-6 *:leading-tight px-3">
			<p class="mb-3">{currentQuestion.a}</p>
			<p class="text-sm {current.secondText}">{currentQuestion.q}</p>
		</div>
	{/if}

	<!-- <div class="grid grid-cols-6 gap-2 mb-4"> -->
	<!-- 	{#each Array.from({ length: current.questions.length }, (_, i) => i) as i (i)} -->
	<!-- 		<button -->
	<!-- 			aria-label="question" -->
	<!-- 			onclick={() => selectQuestion(i)} -->
	<!-- 			class="{answeredQuestions[currentType].has(i) -->
	<!-- 				? current.lightButtonColor -->
	<!-- 				: current.buttonColor} rounded-xl hover:opacity-80 flex items-center justify-center text-lg transition-all duration-200 cursor-pointer border-2 {selectedQuestion === -->
	<!-- 			i -->
	<!-- 				? current.accentColor + ' border-current' -->
	<!-- 				: 'border-transparent'}" -->
	<!-- 		> -->
	<!-- 		</button> -->
	<!-- 	{/each} -->
	<!-- </div> -->

	<!-- <button -->
	<!-- 	class="w-full {current.buttonColor} {current.accentColor} py-3 px-4 rounded-2xl font-medium hover:opacity-80 transition-colors duration-300 text-sm disabled:opacity-50 border-2 border-transparent" -->
	<!-- > -->
	<!-- 	{isAnswered ? "Besvarat ✓" : "Ställ fråga →"} -->
	<!-- </button> -->
</div>
