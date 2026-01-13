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
		displayName: "Are you within 1 km of here?",
		range: 1,
	},
	"two-km": {
		displayName: "Are you within 2 km of here?",
		range: 2,
	},
	"three-km": {
		displayName: "Are you within 3 km of here?",
		range: 3,
	},
	"five-km": {
		displayName: "Are you within 5 km of here?",
		range: 5,
	},
	"ten-km": {
		displayName: "Are you within 10 km of here?",
		range: 10,
	},
};
