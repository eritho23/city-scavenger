export type RelativeQuestion = {
	displayName: string;
	prompt: string;
	kind: "comparison" | "boolean";
};

export enum RelativeKey {
	Longitude = "relative-longitude",
	Latitude = "relative-latitude",
	RailwayDistance = "distance-railway",
	SvartanDistance = "distance-svartan",
	SameAirport = "same-airport",
}

export const RelativeQuestions: Record<RelativeKey, RelativeQuestion> = {
	"relative-longitude": {
		displayName: "Är du öster om mig?",
		prompt: "Är du öster om mig?",
		kind: "comparison",
	},
	"relative-latitude": {
		displayName: "Är du norr om mig?",
		prompt: "Är du norr om mig?",
		kind: "comparison",
	},
	"distance-railway": {
		displayName: "Avstånd till järnväg",
		prompt: "Är du närmare eller längre från järnvägen?",
		kind: "comparison",
	},
	"distance-svartan": {
		displayName: "Avstånd till Svartån",
		prompt: "Är du närmare eller längre från Svartån?",
		kind: "comparison",
	},
	"same-airport": {
		displayName: "Samma närmaste flygplats?",
		prompt:
			"Är närmaste flygplats densamma? (Det finns två flygfält i Västerås)",
		kind: "boolean",
	},
};

export const RelativeQuestionsList: RelativeQuestion[] = Object.values(
	RelativeQuestions,
);

