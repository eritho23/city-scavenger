import OpenAI from "openai";
import { env } from "$env/dynamic/private";

export const client = new OpenAI({
	baseURL: env.OPENAI_API_URL ?? "",
	logLevel: "debug",
	apiKey: "ollama",
});
