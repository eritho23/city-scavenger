import { z } from "zod";

export const PlaceProfile = z.object({
	busLines: z.array(z.number()).default([]),
	busStop: z.string(),
	distanceFromBlackRiver: z.number().nullable(),
	elevation: z.number(),
	lat: z.number(),
	lon: z.number(),
	nearestHealthCentre: z.string(),
	nearestSchool: z.string(),
	nearestWaterFacility: z.string(),
	stopId: z.string().nullable(),
});

export type PlaceProfile = z.infer<typeof PlaceProfile>;
