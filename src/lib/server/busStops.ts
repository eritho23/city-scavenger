import { readFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { dev } from "$app/environment";
import { asset } from "$app/paths";

export interface BusStop {
	name: string;
	lat: number;
	lon: number;
	id: number;
}

let cachedStops: BusStop[] | null = null;

export function loadBusStops(): BusStop[] {
	if (cachedStops) {
		return cachedStops;
	}

    let filePath: string = "";
    if (dev) {
        filePath = join(cwd(), 'static', '/geodata/busstops-raw.geojson');
    } else {
        // TODO: Verify this works in production.
        filePath = asset('/geodata/busstops-raw.geojson')
    }
	const fileContent = readFileSync(filePath, "utf-8");
	const geojson = JSON.parse(fileContent) as { elements: Array<{ id: number; lat: number; lon: number; tags?: { name?: string } }> };

	cachedStops = geojson.elements
		.filter((element) => element.tags?.name)
		.map((element) => ({
			id: element.id,
			name: element.tags!.name!,
			lat: element.lat,
			lon: element.lon,
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
