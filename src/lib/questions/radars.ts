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
		displayName: "1 km",
		range: 1,
	},
	"two-km": {
		displayName: "2 km",
		range: 2,
	},
	"three-km": {
		displayName: "3 km",
		range: 3,
	},
	"five-km": {
		displayName: "5 km",
		range: 5,
	},
	"ten-km": {
		displayName: "10 km",
		range: 10,
	},
};
