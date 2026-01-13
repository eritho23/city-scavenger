import { type Actions, error, fail, redirect } from "@sveltejs/kit";
import { resolve } from "$app/paths";
import { db } from "$lib/database";
import { generatePlaceProfile } from "$lib/placeProfile";
import { getRandomBusStop } from "$lib/server/busStops";

export const actions = {
	createGame: async () => {
		const stop = getRandomBusStop();
		const newPlaceProfile = await generatePlaceProfile(stop);

		if (newPlaceProfile === null) {
			error(500, { message: "Kunde inte skapa platsprofil." });
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
				message: "Kunde inte starta spel",
			});
		}

		redirect(303, resolve("/game/[gameId]", { gameId: result.uid }));
	},
} satisfies Actions;
