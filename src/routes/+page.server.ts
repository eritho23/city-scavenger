import { type Actions, fail } from "@sveltejs/kit";
import { db } from "$lib/database";
import { PlaceProfile } from "$lib/schemas";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const games = await db.selectFrom("game").select(["uid", "place_profile"]).execute();

	return {
		games,
	};
};

export const actions = {
	createGame: async () => {
		const dummyPlaceProfile = PlaceProfile.parse({
			busStop: "Central Station",
		});

		const result = await db
			.insertInto("game")
			.values({
				place_profile: dummyPlaceProfile,
			})
			.returning("uid")
			.executeTakeFirst();

		if (!result) {
			return fail(500, {
				success: false,
				message: "Failed to create game",
			});
		}

		return {
			success: true,
			gameId: result.uid,
		};
	},
} satisfies Actions;
