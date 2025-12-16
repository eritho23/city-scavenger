import { type Actions, error } from "@sveltejs/kit";
import { db } from "$lib/database";
import { PlaceProfile } from "$lib/schemas";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const game = await db
		.selectFrom("game")
		.select(["uid", "ended_at", "started_at", "place_profile"])
		.where("uid", "=", params.gameId)
		.executeTakeFirst();

	if (!game) {
		error(404, { message: "No such game found." });
	}

	const parsedPlaceProfileParseResult = PlaceProfile.safeParse(game.place_profile);
	if (!parsedPlaceProfileParseResult.success || !parsedPlaceProfileParseResult.data) {
		error(500, { message: "Inconsistent place profile data in database." });
	}

	// Do not send the place profile to the client.
	const { place_profile: _, ...gameWithoutPlaceProfile } = game;

	return {
		game,
	};
};

export const actions = {
	askQuestion: async () => {
		return {
			answer: true,
		};
	},
} satisfies Actions;
