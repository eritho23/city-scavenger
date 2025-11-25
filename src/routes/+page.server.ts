import { type Actions, fail } from "@sveltejs/kit";
import { db } from "$lib/database";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const games = await db.selectFrom("game").select(["uid", "place_profile"]).execute();

	return {
		games,
	};
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const busStop = formData.get("bus_stop");
		if (typeof busStop !== "string") {
			return fail(400, {
				success: false,
				message: "Bus stop not provided",
			});
		}

		await db
			.insertInto("game")
			.values({
				place_profile: {
					busStop,
				},
			})
			.execute();

		return {
			success: true,
		};
	},
} satisfies Actions;
