type RadarQuestion = {
	// Range in kilometers.
	range: number;
	displayName: string;
};

enum RadarRange {
	OneKm = "one-km",
	TwoKm = "two-km",
	ThreeKm = "three-km",
	FiveKm = "five-km",
	TenKm = "ten-km",
}

export const RadarQuestions: Record<RadarRange, RadarQuestion> = {
	"one-km": {
		displayName: "Är du inom 1 km härifrån?",
		range: 1,
	},
	"two-km": {
		displayName: "Är du inom 2 km härifrån?",
		range: 2,
	},
	"three-km": {
		displayName: "Är du inom 3 km härifrån?",
		range: 3,
	},
	"five-km": {
		displayName: "Är du inom 5 km härifrån?",
		range: 5,
	},
	"ten-km": {
		displayName: "Är du inom 10 km härifrån?",
		range: 10,
	},
};
