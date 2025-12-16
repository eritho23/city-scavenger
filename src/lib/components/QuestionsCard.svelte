<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let scoreChange: string = "+ 30 poäng";
	export let currentType: number = 0;
	export let answeredQuestions: Record<number, Set<number>> = {
		0: new Set(),
		1: new Set(),
		2: new Set(),
		3: new Set(),
		4: new Set(),
	};

	const dispatch = createEventDispatcher();

	const questionTypes = [
		{
			name: "Relativa frågor",
			icon: "❓",
			color: "bg-blue-100",
			buttonColor: "bg-blue-300",
			accentColor: "text-blue-900",
			lightButtonColor: "bg-blue-200",
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
		{
			name: "Foton",
			icon: "📸",
			color: "bg-yellow-100",
			buttonColor: "bg-yellow-300",
			accentColor: "text-yellow-900",
			lightButtonColor: "bg-yellow-200",
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
			icon: "📡",
			color: "bg-green-100",
			buttonColor: "bg-green-300",
			accentColor: "text-green-900",
			lightButtonColor: "bg-green-200",
			questions: [
				{ q: "Hur långt bort är målpunkten?", a: "Ungefär 800 meter" },
				{ q: "I vilken riktning ligger objektet?", a: "Nordväst" },
				{ q: "Estimera avståndet", a: "Ca 600-700 meter" },
				{ q: "Är det inom 100m?", a: "Nej" },
				{ q: "Ungefär hur många meter?", a: "750 meter" },
				{ q: "Är signalen stark eller svag?", a: "Medel styrka" },
				{ q: "I vilken sektor är målpunkten?", a: "Nordvästlig sektor" },
				{ q: "Närmare eller längre än 500m?", a: "Längre än 500m" },
				{ q: "Vilken kompassriktning?", a: "315 grader (NW)" },
				{ q: "Är målet synligt?", a: "Delvis synligt" },
				{ q: "Hur många grader från norr?", a: "45 grader väst" },
				{ q: "Är det rakt fram eller åt sidan?", a: "Åt vänster och bakåt" },
			],
		},
		{
			name: "Oddball",
			icon: "🎲",
			color: "bg-purple-100",
			buttonColor: "bg-purple-300",
			accentColor: "text-purple-900",
			lightButtonColor: "bg-purple-200",
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
			icon: "🎯",
			color: "bg-pink-100",
			buttonColor: "bg-pink-300",
			accentColor: "text-pink-900",
			lightButtonColor: "bg-pink-200",
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

	let isTransitioning = false;
	let slideDirection = 0;
	let selectedQuestion = 0;

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
			answeredQuestions = answeredQuestions;
			dispatch("questionAnswered", {
				type: currentType,
				questionIndex: selectedQuestion,
			});
		}
	}

	$: current = questionTypes[currentType];
	$: currentQuestion = current.questions[selectedQuestion];
	$: isAnswered = answeredQuestions[currentType].has(selectedQuestion);
</script>

<div class="relative overflow-hidden rounded-3xl">
	<div
		class="transition-all duration-300 ease-in-out {current.color} rounded-3xl p-5"
		style="opacity: {slideDirection === 0
			? 1
			: 0}; transform: translateX({slideDirection * 50}px);"
	>
		<div class="flex justify-between items-center mb-4">
			<div class="flex items-center gap-3">
				<button
					on:click={prevType}
					disabled={isTransitioning}
					class="text-2xl font-bold {current.accentColor} hover:opacity-70 transition-opacity disabled:opacity-50"
					>‹</button
				>
				<span class="text-sm font-semibold {current.accentColor} min-w-32"
					>{current.name}</span
				>
				<button
					on:click={nextType}
					disabled={isTransitioning}
					class="text-2xl font-bold {current.accentColor} hover:opacity-70 transition-opacity disabled:opacity-50"
					>›</button
				>
			</div>
			<span class="text-sm font-semibold {current.accentColor}"
				>{scoreChange}</span
			>
		</div>

		<div class="grid grid-cols-6 gap-2 mb-4">
			{#each current.questions as _, i (i)}
				<button
					on:click={() => selectQuestion(i)}
					class="aspect-square {answeredQuestions[currentType].has(i)
						? current.lightButtonColor
						: current.buttonColor} rounded-xl hover:opacity-80 flex items-center justify-center text-lg transition-all duration-200 cursor-pointer border-2 {selectedQuestion ===
					i
						? current.accentColor + ' border-current'
						: 'border-transparent'}"
				>
					{current.icon}
				</button>
			{/each}
		</div>

		<div class="mb-4">
			<p class="text-xs font-medium {current.accentColor} mb-2">
				Q: {currentQuestion.q}
			</p>
			{#if isAnswered}
				<div
					class="bg-white rounded-xl p-3 border-l-4 {current.accentColor.replace(
						'text-',
						'border-',
					)}"
				>
					<p class="text-xs font-semibold {current.accentColor} mb-1">
						✓ Korrekt svar:
					</p>
					<p class="text-sm font-bold {current.accentColor}">
						{currentQuestion.a}
					</p>
				</div>
			{/if}
		</div>

		<button
			on:click={submitAnswer}
			disabled={isAnswered}
			class="w-full {current.buttonColor} {current.accentColor} py-3 px-4 rounded-2xl font-medium hover:opacity-80 transition-colors duration-300 text-sm disabled:opacity-50 border-2 border-transparent"
		>
			{isAnswered ? "Besvarat ✓" : "Ställ fråga →"}
		</button>
	</div>
</div>
