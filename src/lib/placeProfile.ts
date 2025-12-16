import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { client } from "./openaiClient";
import { PlaceProfile } from "./schemas";

export async function generatePlaceProfile(busStopName: string): Promise<PlaceProfile | null> {
	const context = `
    Stop name: Strandbron

  `;
	const completion = await client.chat.completions.create({
		model: "gemma3:12b",
		messages: [
			{
				role: "system",
				content: `You are generating place profiles for a geography game in Västerås, Sweden. 
				Provide accurate information about bus stops including nearby landmarks and facilities.`,
			},
			{
				role: "user",
				content: `Generate a complete place profile for the bus stop: ${busStopName}
				
        Additional context: ${context}`,
			},
		],
		response_format: zodResponseFormat(PlaceProfile, "place_profile"),
	});

	if (completion === null) {
		return null;
	}

	if (completion.choices[0].message.content === null) {
		return null;
	}

	const placeProfile = JSON.parse(completion.choices[0].message.content);
	return PlaceProfile.parse(placeProfile);
}
