import { type Actions, fail } from "@sveltejs/kit";
import { parse } from "valibot";
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
	default: async ({ request }) => {
		const formData = await request.formData();

		const formDataParsed = parse(PlaceProfile, formData);
		if (!formDataParsed) {
			return fail(500, {
				success: false,
				message: "Schema parsing failed",
			});
		}

		await db
			.insertInto("game")
			.values({
				place_profile: formDataParsed,
			})
			.execute();

		return {
			success: true,
		};
	},
} satisfies Actions;
