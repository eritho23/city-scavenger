import OpenAI from "openai";
import { env } from "$env/dynamic/private";

export const client = new OpenAI({
	baseURL: env.OPENAI_API_URL ?? "",
	apiKey: env.OPENAI_API_URL ?? "ollama",
});
