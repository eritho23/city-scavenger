import type { PageServerLoad } from "./$types";
import { db } from "$lib/database";

export const load: PageServerLoad = async () => {
	const games = await db
		.selectFrom("game")
		.select(["uid", "started_at", "ended_at"]) // exclude place_profile
		.orderBy("started_at", "desc")
		.execute();

	return { games };
};
