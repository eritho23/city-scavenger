import { type Actions, error, fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { db } from "$lib/database";
import { generatePlaceProfile } from "$lib/placeProfile";

export const actions = {
	createGame: async () => {
		const newPlaceProfile = await generatePlaceProfile("Strandbron");

		if (newPlaceProfile === null) {
			error(500, { message: "Failed to generate place profile." });
		}

		const result = await db
			.insertInto("game")
			.values({
				place_profile: newPlaceProfile,
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
