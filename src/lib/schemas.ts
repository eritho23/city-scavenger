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
	busLines: z.set(z.enum(BusLine)),
	busStop: z.string(),
	distanceFromBlackRiver: z.number().optional(),
	elevation: z.number(),
	lat: z.number(),
	lon: z.number(),
	nearestHealthCentre: z.string(),
	nearestSchool: z.string(),
	nearestWaterFacility: z.string(),
	postCode: z.string().regex(/[\d]{5}/),
	stopId: z.string().optional(),
});

export type PlaceProfile = z.infer<typeof PlaceProfile>;
