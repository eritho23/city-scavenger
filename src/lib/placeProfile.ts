import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { client } from "$lib/server/openaiClient";
import { PlaceProfile } from "./schemas";

export interface BusStopData {
	name: string;
	lat: number;
	lon: number;
	id: number;
}

export async function generatePlaceProfile(stop: BusStopData): Promise<PlaceProfile | null> {
	const context = `
    Stop name: ${stop.name}
    Coordinates: ${stop.lat}, ${stop.lon}
	Stop ID: ${stop.id}
  `;
	const completion = await client.chat.completions.create({
		model: "gemma3:12b",
		messages: [
			{
				role: "system",
				content: `You are generating place profiles for a geography game in Västerås, Sweden. 
				Provide accurate information about bus stops including nearby landmarks and facilities.
				IMPORTANT: The latitude must be exactly ${stop.lat} and the longitude must be exactly ${stop.lon}.`,
			},
			{
				role: "user",
				content: `Generate a complete place profile for the bus stop: ${stop.name}
				
        Additional context: ${context}`,
			},
		],
		response_format: zodResponseFormat(PlaceProfile, "place_profile"),
	});

	if (completion === null) {
		console.log("returning null");
		return null;
	}

	if (completion.choices[0].message.content === null) {
		console.log("returning null, content is null");
		return null;
	}

	console.log("here");
	console.log(completion.choices[0].message.content);

	const placeProfile = PlaceProfile.safeParse(JSON.parse(completion.choices[0].message.content));
	if (!placeProfile.success) {
		console.log(placeProfile.error);
		return null;
	} else {
		console.log(placeProfile.data);
		return placeProfile.data;
	}
}
