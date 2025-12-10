import { error } from "@sveltejs/kit";
import { db } from "$lib/database";
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

	return {
		game,
	};
};
