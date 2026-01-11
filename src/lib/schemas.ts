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
	postCode: z.string(),
	stopId: z.string().nullable(),
});

// export const PlaceProfile = z.object({
// 	busLines: z.array(z.nativeEnum(BusLine)).default([]),
// 	busStop: z.string().default("Unknown Stop"),
// 	distanceFromBlackRiver: z.number().nullable().default(null),
// 	elevation: z.number().default(0),
// 	lat: z.number().default(0),
// 	lon: z.number().default(0),
// 	nearestHealthCentre:  z.string().default("Unknown"),
// 	nearestSchool: z.string().default("Unknown"),
// 	nearestWaterFacility: z.string().default("Unknown"),
// 	postCode: z
// 		.string()
// 		.length(5)
// 		.default("00000"),
// 	stopId: z.string().nullable().default(null),
// });

export type PlaceProfile = z.infer<typeof PlaceProfile>;
