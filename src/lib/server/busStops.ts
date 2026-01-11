import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { dev } from "$app/environment";
import { asset } from "$app/paths";

export interface BusStop {
	name: string;
	lat: number;
	lon: number;
	id: number;
	routes: number[];
}

let cachedStops: BusStop[] | null = null;

export function loadBusStops(): BusStop[] {
	if (cachedStops) {
		return cachedStops;
	}

	let filePath: string = "";
	if (dev) {
		// Ensure we don't pass an absolute segment to join
		filePath = join(cwd(), 'static', 'geodata/busstops-raw.geojson');
	} else {
		// TODO: Verify this works in production.
		filePath = asset('/geodata/busstops-raw.geojson')
	}
	const fileContent = readFileSync(filePath, "utf-8");
	const geojson = JSON.parse(fileContent) as { elements: Array<{ id: number; lat: number; lon: number; tags?: Record<string, string | undefined> }> };

	function parseRoutesFromTags(tags?: Record<string, string | undefined>): number[] {
		if (!tags) return [];
		const candidates = ["route_ref", "lines", "bus_routes", "routes"] as const;
		const tokens: string[] = [];
		for (const key of candidates) {
			const raw = tags[key];
			if (!raw) continue;
			raw
				.split(/[;,/\s]+/)
				.map((t) => t.trim())
				.filter((t) => t.length > 0)
				.forEach((t) => tokens.push(t));
		}
		const nums = tokens
			.map((t) => {
				const n = Number.parseInt(t, 10);
				return Number.isNaN(n) ? null : n;
			})
			.filter((n): n is number => n !== null);
		return Array.from(new Set(nums)).sort((a, b) => a - b);
	}

	cachedStops = geojson.elements
		.filter((element) => element.tags?.name)
		.map((element) => ({
			id: element.id,
			name: (element.tags! as Record<string, string>).name!,
			lat: element.lat,
			lon: element.lon,
			routes: parseRoutesFromTags(element.tags),
		}));

	return cachedStops;
}

export function getRandomBusStop(): BusStop {
	const stops = loadBusStops();
	return stops[Math.floor(Math.random() * stops.length)]!;
}

export function getBusStopByName(name: string): BusStop | undefined {
	const stops = loadBusStops();
	return stops.find((stop) => stop.name.toLowerCase() === name.toLowerCase());
}
