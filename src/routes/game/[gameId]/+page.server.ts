import { type Actions, error, fail } from "@sveltejs/kit";
import { db } from "$lib/database";
import { PlaceProfile } from "$lib/schemas";
import { calculateDistance } from "$lib/server/distance";
import { RadarQuestions } from "$lib/questions/radars";
import { RelativeKey, RelativeQuestions } from "$lib/questions/relative";
import type { PageServerLoad } from "./$types";

export const ssr = false;

type AnswerRecord = {
	questionType: string;
	questionId: string;
	timestamp: string;
	userPosition: { lat: number; lng: number };
	answer: string;
};

export const load: PageServerLoad = async ({ params }) => {
	const gameId = params.gameId;
	if (!gameId) {
		error(404, { message: "Missing gameId" });
	}

	const game = await db
		.selectFrom("game")
		.select(["uid", "ended_at", "started_at", "place_profile", "answers"])
		.where("uid", "=", gameId)
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
	void _;

	return {
		game: gameWithoutPlaceProfile,
	};
};

export const actions = {
	askQuestion: async ({ params, request }) => {
		const gameId = params.gameId;
		if (!gameId) {
			return fail(404, { error: "Missing gameId" });
		}
		const formData = await request.formData();

		const questionType = formData.get("questionType") as string;
		const questionId = formData.get("questionId") as string;
		const userLat = Number.parseFloat(formData.get("userLat") as string);
		const userLng = Number.parseFloat(formData.get("userLng") as string);

		console.log("[askQuestion] Client is asking:", {
			questionType,
			questionId,
			userPosition: { userLat, userLng },
		});

		// Validate form data
		if (!questionType || !questionId || Number.isNaN(userLat) || Number.isNaN(userLng)) {
			console.error("[askQuestion] Invalid question data");
			return fail(400, { error: "Invalid form data" });
		}

		// Fetch game and place profile
		const game = await db
			.selectFrom("game")
			.select(["uid", "place_profile", "answers"])
			.where("uid", "=", gameId)
			.executeTakeFirst();

		if (!game) {
			return fail(404, { error: "Game not found" });
		}

		const placeProfileResult = PlaceProfile.safeParse(game.place_profile);
		if (!placeProfileResult.success) {
			return fail(500, { error: "Invalid place profile" });
		}

		const placeProfile = placeProfileResult.data;
		let answer = "";

		// Calculate the answer based on question type
		if (questionType === "radar") {
			const radarQuestion = RadarQuestions[questionId as keyof typeof RadarQuestions];
			if (!radarQuestion) {
				return fail(400, { error: "Invalid radar question" });
			}

			// Calculate distance from user to target
			const distance = calculateDistance(
				userLat,
				userLng,
				placeProfile.lat,
				placeProfile.lon,
			);

			// Answer is true if within range, false otherwise
			const isWithinRange = distance <= radarQuestion.range;
			answer = isWithinRange ? "true" : "false";
			console.log("[askQuestion] Radar answer:", { distance, range: radarQuestion.range, answer });
		} else if (questionType === "relative") {
			const relativeQuestion =
				RelativeQuestions[questionId as keyof typeof RelativeQuestions];
			if (!relativeQuestion) {
				return fail(400, { error: "Invalid relative question" });
			}

			// Handle longitude and latitude questions
			if (questionId === RelativeKey.Longitude) {
				// Are you east of the target? (higher longitude = further east)
				const isEast = userLng > placeProfile.lon;
				answer = isEast ? "true" : "false";
				console.log("[askQuestion] Longitude answer:", { userLng, targetLng: placeProfile.lon, answer });
			} else if (questionId === RelativeKey.Latitude) {
				// Are you north of the target? (higher latitude = further north)
				const isNorth = userLat > placeProfile.lat;
				answer = isNorth ? "true" : "false";
				console.log("[askQuestion] Latitude answer:", { userLat, targetLat: placeProfile.lat, answer });
			} else {
				return fail(400, { error: "Question type not yet implemented" });
			}
		} else {
			return fail(400, { error: "Invalid question type" });
		}

		// Store question and answer in database
		const questionRecord = {
			questionType,
			questionId,
			timestamp: new Date().toISOString(),
			userPosition: { lat: userLat, lng: userLng },
			answer,
		};

		// Update game's answers array - check if question already answered
		const currentAnswers: AnswerRecord[] = Array.isArray(game.answers)
			? (game.answers as AnswerRecord[])
			: [];
		
		// Remove any existing answer for this question (to allow re-answering)
		const filteredAnswers = currentAnswers.filter(
			(record) => !(record.questionType === questionType && record.questionId === questionId)
		);
		const updatedAnswers: AnswerRecord[] = [...filteredAnswers, questionRecord];

		await db
			.updateTable("game")
			.set({ answers: JSON.stringify(updatedAnswers) })
			.where("uid", "=", gameId)
			.execute();

		// Insert question record
		await db
			.insertInto("question")
			.values({
				game: gameId,
				kind: questionType as "radar" | "relative",
				parameters: JSON.stringify({
					questionId,
					userPosition: { lat: userLat, lng: userLng },
				}),
				response: JSON.stringify({
					answer,
				}),
			})
			.execute();

		console.log("[askQuestion] Sending answer to client:", answer);

		return {
			success: true,
			answer,
		};
	},
} satisfies Actions;
