import { z } from "zod";

enum BusLine {
	One = 1,
	Two = 2,
	Three = 3,
	Four = 4,
	Five = 5,
	Six = 6,
	Seven = 7,
	Eight = 8,
	Fourteen = 14,
	Fifteen = 15,
	TwentyOne = 21,
	TwentyTwo = 22,
	TwentyThree = 23,
	TwentyFour = 24,
	TwentyFive = 25,
}

export const PlaceProfile = z.object({
	busLines: z.array(z.enum(BusLine)).default([]),
	busStop: z.string().default("Unknown Stop"),
	distanceFromBlackRiver: z.number().optional(),
	elevation: z.number().default(0),
	lat: z.number().default(0),
	lon: z.number().default(0),
	nearestHealthCentre: z.string().default("Unknown"),
	nearestSchool: z.string().default("Unknown"),
	nearestWaterFacility: z.string().default("Unknown"),
	postCode: z
		.string()
		.regex(/[\d]{5}/)
		.default("00000"),
	stopId: z.string().optional(),
});

export type PlaceProfile = z.infer<typeof PlaceProfile>;
