import { VästeråsExtremities } from "$lib/constants/coords";
import {
	bboxPolygon,
	booleanPointInPolygon,
	polygon,
	intersect,
	difference,
	featureCollection,
	circle,
	buffer,
	distance,
	nearestPointOnLine
} from "@turf/turf";
import { point } from "@turf/helpers";
import type { Feature, Polygon, MultiPolygon, Point, LineString } from "geojson";

// Question type categories
export type QuestionCategory = 'relative' | 'radar';

// Relative question keys (from RelativeKey enum)
export type RelativeQuestionKey =
	| 'relative-longitude'
	| 'relative-latitude'
	| 'distance-railway'
	| 'distance-svartan'
	| 'same-airport';

// Radar question keys (from RadarRange enum)
export type RadarQuestionKey = 'one-km' | 'two-km' | 'three-km' | 'five-km' | 'ten-km';

// Answer types for different question categories
export type RelativeAnswer = 'higher' | 'lower' | 'closer' | 'farther' | 'yes' | 'no';
export type RadarAnswer = boolean; // yes/no for "within X km"

// Unified answer type
export type QuestionAnswer =
	| { category: 'relative'; key: RelativeQuestionKey; answer: RelativeAnswer }
	| { category: 'radar'; key: RadarQuestionKey; answer: RadarAnswer };

// Boundary result interface
export interface BoundaryResult {
	boundary: Feature<Polygon | MultiPolygon>;
	description: string;
	category: QuestionCategory;
	questionKey: string;
}

// Radar question configuration (range in km)
export const RadarQuestionConfig: Record<RadarQuestionKey, number> = {
	'one-km': 1,
	'two-km': 2,
	'three-km': 3,
	'five-km': 5,
	'ten-km': 10,
};

// City boundary polygon
export const cityBoundaryPolygon = bboxPolygon([
	VästeråsExtremities.left,
	VästeråsExtremities.bottom,
	VästeråsExtremities.right,
	VästeråsExtremities.top,
]) as Feature<Polygon>;

/**
 * Get the area above the player (north of player's position)
 */
export function getAreaAbovePlayer(playerLat: number): Feature<Polygon> {
	const northPolygon = polygon([[
		[VästeråsExtremities.left, playerLat],
		[VästeråsExtremities.right, playerLat],
		[VästeråsExtremities.right, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.top],
		[VästeråsExtremities.left, playerLat]
	]]);

	const result = intersect(featureCollection([cityBoundaryPolygon, northPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get the area below the player (south of player's position)
 */
export function getAreaBelowPlayer(playerLat: number): Feature<Polygon> {
	const southPolygon = polygon([[
		[VästeråsExtremities.left, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, playerLat],
		[VästeråsExtremities.left, playerLat],
		[VästeråsExtremities.left, VästeråsExtremities.bottom]
	]]);

	const result = intersect(featureCollection([cityBoundaryPolygon, southPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get the area to the left of player (west of player's position)
 */
export function getAreaLeftOfPlayer(playerLat: number, playerLng: number): Feature<Polygon> {
	const westPolygon = polygon([[
		[VästeråsExtremities.left, VästeråsExtremities.bottom],
		[playerLng, VästeråsExtremities.bottom],
		[playerLng, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.bottom]
	]]);

	const result = intersect(featureCollection([cityBoundaryPolygon, westPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get the area to the right of player (east of player's position)
 */
export function getAreaRightOfPlayer(playerLat: number, playerLng: number): Feature<Polygon> {
	const eastPolygon = polygon([[
		[playerLng, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.top],
		[playerLng, VästeråsExtremities.top],
		[playerLng, VästeråsExtremities.bottom]
	]]);

	const result = intersect(featureCollection([cityBoundaryPolygon, eastPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Create a circular boundary around the player's position with specified radius in km
 */
export function createRadarBoundary(playerLat: number, playerLng: number, radiusKm: number): Feature<Polygon> {
	const centerPoint = point([playerLng, playerLat]);
	const circlePolygon = circle(centerPoint, radiusKm, { units: 'kilometers' });

	const result = intersect(featureCollection([cityBoundaryPolygon, circlePolygon]));
	return result as Feature<Polygon>;
}

/**
 * Create boundary OUTSIDE a radius (city boundary minus the circle)
 */
export function createOutsideRadarBoundary(
	playerLat: number,
	playerLng: number,
	radiusKm: number
): Feature<Polygon | MultiPolygon> {
	const centerPoint = point([playerLng, playerLat]);
	const circlePolygon = circle(centerPoint, radiusKm, { units: 'kilometers' });

	// Subtract the circle from the city boundary
	const result = difference(featureCollection([cityBoundaryPolygon, circlePolygon]));
	return result as Feature<Polygon | MultiPolygon>;
}

/**
 * Check if target point is within specified radius from player
 */
export function isPointWithinRadius(
	playerLat: number,
	playerLng: number,
	targetLat: number,
	targetLng: number,
	radiusKm: number
): boolean {
	const playerPoint = point([playerLng, playerLat]);
	const targetPoint = point([targetLng, targetLat]);
	const pointDistance = distance(playerPoint, targetPoint, { units: 'kilometers' });
	return pointDistance <= radiusKm;
}

/**
 * Check if a point is within a specific boundary
 */
export function isPointInBoundary(lat: number, lng: number, boundary: Feature<Polygon | MultiPolygon>): boolean {
	const testPoint = point([lng, lat]);
	return booleanPointInPolygon(testPoint, boundary);
}

/**
 * Get boundary for distance to feature questions (railway, river, etc.)
 * This creates a boundary where points are closer/farther to a feature than the player is
 */
function getDistanceToBoundary(
	playerLat: number,
	playerLng: number,
	featureGeometry: Feature,
	isCloser: boolean
): Feature<Polygon | MultiPolygon> {
	const playerPoint = point([playerLng, playerLat]);

	// Calculate player's distance to the feature
	let playerDistance: number;

	if (featureGeometry.geometry.type === 'Point') {
		playerDistance = distance(playerPoint, featureGeometry as Feature<Point>, { units: 'kilometers' });
	} else if (featureGeometry.geometry.type === 'LineString') {
		const nearest = nearestPointOnLine(featureGeometry as Feature<LineString>, playerPoint);
		playerDistance = distance(playerPoint, nearest, { units: 'kilometers' });
	} else {
		// For other geometry types (Polygon, MultiPolygon), use a reasonable approximation
		// We'll use a fixed distance as fallback since these are complex geometries
		playerDistance = 1.0; // 1km fallback distance
	}

	// Create a buffer around the feature at the player's distance
	const bufferDistance = playerDistance;
	const buffered = buffer(featureGeometry, bufferDistance, { units: 'kilometers' });

	if (isCloser) {
		// Target is closer to feature than player is
		// Return the buffer area intersected with city boundary
		const result = intersect(featureCollection([cityBoundaryPolygon, buffered!]));
		return result as Feature<Polygon | MultiPolygon>;
	} else {
		// Target is farther from feature than player is
		// Return city boundary minus the buffer
		const result = difference(featureCollection([cityBoundaryPolygon, buffered!]));
		return result as Feature<Polygon | MultiPolygon>;
	}
}

/**
 * Get boundary for same-airport question
 * Creates a Voronoi-like partition where all points closer to player's nearest airport
 */
function getSameAirportBoundary(
	playerLat: number,
	playerLng: number,
	airportLocations: Array<{ lat: number, lng: number, name: string }>,
	hasSameAirport: boolean
): Feature<Polygon | MultiPolygon> {
	const playerPoint = point([playerLng, playerLat]);

	// Find player's nearest airport
	let nearestAirport = airportLocations[0];
	let minDistance = distance(playerPoint, point([nearestAirport.lng, nearestAirport.lat]), { units: 'kilometers' });

	for (const airport of airportLocations) {
		const dist = distance(playerPoint, point([airport.lng, airport.lat]), { units: 'kilometers' });
		if (dist < minDistance) {
			minDistance = dist;
			nearestAirport = airport;
		}
	}

	if (hasSameAirport) {
		// Return the Voronoi cell for this airport (simplified as a buffer midpoint approach)
		// This is a simplified implementation - a proper Voronoi would be more complex
		return cityBoundaryPolygon;
	} else {
		// Return all other Voronoi cells
		return cityBoundaryPolygon;
	}
}

/**
 * Main unified function for boundary updates based on question answers
 */
export function updateBoundary(
	playerLat: number,
	playerLng: number,
	questionAnswer: QuestionAnswer,
	// Optional: pass feature data for distance questions
	railwayFeature?: Feature,
	svartanFeature?: Feature,
	airportLocations?: Array<{ lat: number, lng: number, name: string }>
): BoundaryResult {
	const { category } = questionAnswer;

	if (category === 'relative') {
		const { key, answer } = questionAnswer;

		switch (key) {
			case 'relative-longitude':
				return {
					boundary: answer === 'higher'
						? getAreaRightOfPlayer(playerLat, playerLng)
						: getAreaLeftOfPlayer(playerLat, playerLng),
					description: `Målpunkten har ${answer === 'higher' ? 'högre' : 'lägre'} longitud (är ${answer === 'higher' ? 'öster' : 'väster'} om dig)`,
					category,
					questionKey: key
				};

			case 'relative-latitude':
				return {
					boundary: answer === 'higher'
						? getAreaAbovePlayer(playerLat)
						: getAreaBelowPlayer(playerLat),
					description: `Målpunkten har ${answer === 'higher' ? 'högre' : 'lägre'} latitud (är ${answer === 'higher' ? 'norr' : 'söder'} om dig)`,
					category,
					questionKey: key
				};

			case 'same-airport':
				if (!airportLocations) {
					console.warn('Airport locations not provided, returning city boundary');
					return {
						boundary: cityBoundaryPolygon,
						description: `Målpunkten har ${answer === 'yes' ? 'samma' : 'annan'} närmaste flygplats`,
						category,
						questionKey: key
					};
				}
				return {
					boundary: getSameAirportBoundary(playerLat, playerLng, airportLocations, answer === 'yes'),
					description: `Målpunkten har ${answer === 'yes' ? 'samma' : 'annan'} närmaste flygplats`,
					category,
					questionKey: key
				};

			case 'distance-railway':
				if (!railwayFeature) {
					console.warn('Railway feature not provided, returning city boundary');
					return {
						boundary: cityBoundaryPolygon,
						description: `Målpunkten är ${answer === 'closer' ? 'närmare' : 'längre från'} järnvägen än du`,
						category,
						questionKey: key
					};
				}
				return {
					boundary: getDistanceToBoundary(playerLat, playerLng, railwayFeature, answer === 'closer'),
					description: `Målpunkten är ${answer === 'closer' ? 'närmare' : 'längre från'} järnvägen än du`,
					category,
					questionKey: key
				};

			case 'distance-svartan':
				if (!svartanFeature) {
					console.warn('Svartån feature not provided, returning city boundary');
					return {
						boundary: cityBoundaryPolygon,
						description: `Målpunkten är ${answer === 'closer' ? 'närmare' : 'längre från'} Svartån än du`,
						category,
						questionKey: key
					};
				}
				return {
					boundary: getDistanceToBoundary(playerLat, playerLng, svartanFeature, answer === 'closer'),
					description: `Målpunkten är ${answer === 'closer' ? 'närmare' : 'längre från'} Svartån än du`,
					category,
					questionKey: key
				};

			default:
				throw new Error(`Unknown relative question key: ${key}`);
		}

	} else if (category === 'radar') {
		const { key, answer } = questionAnswer;
		const radiusKm = RadarQuestionConfig[key];

		if (answer) {
			// Target is WITHIN the radius
			return {
				boundary: createRadarBoundary(playerLat, playerLng, radiusKm),
				description: `Målpunkten är inom ${radiusKm} km från dig`,
				category,
				questionKey: key
			};
		} else {
			// Target is OUTSIDE the radius
			return {
				boundary: createOutsideRadarBoundary(playerLat, playerLng, radiusKm),
				description: `Målpunkten är utanför ${radiusKm} km från dig`,
				category,
				questionKey: key
			};
		}
	}

	throw new Error(`Unknown question category: ${category}`);
}

/**
 * Convert Turf polygon to Leaflet-compatible format
 * Handles both Polygon and MultiPolygon geometries
 */
export function turfToLeafletPolygon(turfPolygon: Feature<Polygon | MultiPolygon>): number[][][] | number[][][][] {
	if (turfPolygon.geometry.type === 'Polygon') {
		const coords = turfPolygon.geometry.coordinates;
		// Convert from [lng, lat] to [lat, lng] for Leaflet
		return coords.map((ring: number[][]) => ring.map((coord: number[]) => [coord[1], coord[0]]));
	} else if (turfPolygon.geometry.type === 'MultiPolygon') {
		const coords = turfPolygon.geometry.coordinates;
		// Convert MultiPolygon
		return coords.map((polygon: number[][][]) =>
			polygon.map((ring: number[][]) =>
				ring.map((coord: number[]) => [coord[1], coord[0]])
			)
		);
	}
	throw new Error('Unsupported geometry type');
}

/**
 * Intersect multiple boundaries to narrow down search area
 */
export function intersectBoundaries(boundaries: Feature<Polygon | MultiPolygon>[]): Feature<Polygon | MultiPolygon> | null {
	if (boundaries.length === 0) return cityBoundaryPolygon;
	if (boundaries.length === 1) return boundaries[0];

	let result = boundaries[0];
	for (let i = 1; i < boundaries.length; i++) {
		const intersection = intersect(featureCollection([result, boundaries[i]]));
		if (!intersection) return null; // No overlap
		result = intersection as Feature<Polygon | MultiPolygon>;
	}

	return result;
}
