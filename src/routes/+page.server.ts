import { type Actions, fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
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

		redirect(303, resolve("/game/[gameId]", { gameId: result.uid }));
	},
} satisfies Actions;
