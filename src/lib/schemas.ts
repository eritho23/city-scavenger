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
	busStop: z.string(),
	stopId: z.string().optional(),
	lat: z.number(),
	lon: z.number(),
	elevation: z.number(),
	postCode: z.string().regex(/[\d]{5}/),
	busLines: z.set(z.enum(BusLine)),
	nearestSchool: z.string(),
	nearestHealthCentre: z.string(),
	// Kb-badet, Lögarängsbadet, Kokpunkten.
	nearestWaterFacility: z.string(),
	distanceFromBlackRiver: z.number().optional(),
});

export type PlaceProfile = z.infer<typeof PlaceProfile>;
