import type { Feature, LineString } from "geojson";

export const svartanLineFeature: Feature<LineString> = {
	type: "Feature",
	properties: {
		name: "Svartån",
	},
	geometry: {
		type: "LineString",
		coordinates: [
			[16.466103, 59.644673],
			[16.4805, 59.6405],
			[16.497, 59.634],
			[16.514, 59.628],
			[16.531, 59.6215],
			[16.548, 59.616],
			[16.565, 59.6105],
			[16.582, 59.605],
			[16.599, 59.599],
			[16.614, 59.594],
			[16.624718, 59.5885],
		],
	},
};

export const airportLocations = [
	{ name: "Hässlö", lat: 59.589504, lng: 16.631455 },
	{ name: "Johannisberg", lat: 59.577632, lng: 16.50342 },
];
