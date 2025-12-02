import * as v from "valibot";

type PlaceProfile = v.InferOutput<typeof PlaceProfile>;
export const PlaceProfile = v.object({
	busStop: v.string(),
	lat: v.number(),
	lon: v.number(),
	elevation: v.number(),
});
