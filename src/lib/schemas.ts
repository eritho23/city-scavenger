import { z } from "zod";

export const PlaceProfile = z.object({
	busStop: z.string(),
});

export type PlaceProfile = z.infer<typeof PlaceProfile>;
