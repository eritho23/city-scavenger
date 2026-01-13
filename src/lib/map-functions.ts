import { VästeråsExtremities } from "$lib/constants/coords";
import { calculateDistance } from "$lib/server/distance";
import {
	bboxPolygon,
	booleanPointInPolygon,
	polygon,
	intersect,
	difference,
	union,
	featureCollection,
	circle,
	buffer,
	nearestPointOnLine,
	lineString
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
 * Validate that coordinates are within city boundaries
 */
export function validateCoordinates(lat: number, lng: number): boolean {
	return lat >= VästeråsExtremities.bottom &&
		lat <= VästeråsExtremities.top &&
		lng >= VästeråsExtremities.left &&
		lng <= VästeråsExtremities.right;
}

/**
 * Get the area above the player (north of player's position)
 */
export function getAreaAbovePlayer(playerLat: number): Feature<Polygon> {
	if (!validateCoordinates(playerLat, VästeråsExtremities.left)) {
		console.warn('Player latitude outside city bounds');
	}

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
	if (!validateCoordinates(playerLat, VästeråsExtremities.left)) {
		console.warn('Player latitude outside city bounds');
	}

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
export function getAreaLeftOfPlayer(playerLng: number): Feature<Polygon> {
	if (!validateCoordinates(VästeråsExtremities.bottom, playerLng)) {
		console.warn('Player longitude outside city bounds');
	}

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
export function getAreaRightOfPlayer(playerLng: number): Feature<Polygon> {
	if (!validateCoordinates(VästeråsExtremities.bottom, playerLng)) {
		console.warn('Player longitude outside city bounds');
	}

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
	if (!validateCoordinates(playerLat, playerLng)) {
		console.warn('Player position outside city bounds');
	}

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
	if (!validateCoordinates(playerLat, playerLng)) {
		console.warn('Player position outside city bounds');
	}

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
	const distanceKm = calculateDistance(playerLat, playerLng, targetLat, targetLng);
	return distanceKm <= radiusKm;
}

/**
 * Check if a point is within a specific boundary
 */
export function isPointInBoundary(lat: number, lng: number, boundary: Feature<Polygon | MultiPolygon>): boolean {
	const testPoint = point([lng, lat]);
	return booleanPointInPolygon(testPoint, boundary);
}

/**
 * Calculate distance from a point to a feature (Point, LineString, Polygon, etc.)
 */
function getDistanceToFeature(
	pointLat: number,
	pointLng: number,
	feature: Feature
): number {
	const testPoint = point([pointLng, pointLat]);

	if (feature.geometry.type === 'Point') {
		const featurePoint = feature as Feature<Point>;
		return calculateDistance(
			pointLat,
			pointLng,
			featurePoint.geometry.coordinates[1],
			featurePoint.geometry.coordinates[0]
		);
	} else if (feature.geometry.type === 'LineString') {
		const nearest = nearestPointOnLine(feature as Feature<LineString>, testPoint);
		return calculateDistance(
			pointLat,
			pointLng,
			nearest.geometry.coordinates[1],
			nearest.geometry.coordinates[0]
		);
	} else if (feature.geometry.type === 'Polygon') {
		// Find distance to polygon boundary (exterior ring)
		const coords = feature.geometry.coordinates[0] as number[][];
		const line = lineString(coords);
		const nearest = nearestPointOnLine(line, testPoint);
		return calculateDistance(
			pointLat,
			pointLng,
			nearest.geometry.coordinates[1],
			nearest.geometry.coordinates[0]
		);
	} else if (feature.geometry.type === 'MultiPolygon') {
		// Find minimum distance to any polygon in the MultiPolygon
		let minDistance = Infinity;
		const multiPoly = feature.geometry.coordinates;

		for (const poly of multiPoly) {
			const coords = poly[0] as number[][];
			const line = lineString(coords);
			const nearest = nearestPointOnLine(line, testPoint);
			const dist = calculateDistance(
				pointLat,
				pointLng,
				nearest.geometry.coordinates[1],
				nearest.geometry.coordinates[0]
			);
			minDistance = Math.min(minDistance, dist);
		}

		return minDistance;
	}

	throw new Error(`Unsupported geometry type: ${feature.geometry.type}`);
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
	// Calculate player's distance to the feature
	const playerDistance = getDistanceToFeature(playerLat, playerLng, featureGeometry);

	// Create a buffer around the feature at the player's distance
	const buffered = buffer(featureGeometry, playerDistance, { units: 'kilometers' });

	if (!buffered) {
		console.error('Buffer operation failed');
		return cityBoundaryPolygon;
	}

	if (isCloser) {
		// Target is closer to feature than player is
		// Return the buffer area intersected with city boundary
		const result = intersect(featureCollection([cityBoundaryPolygon, buffered]));
		return result as Feature<Polygon | MultiPolygon>;
	} else {
		// Target is farther from feature than player is
		// Return city boundary minus the buffer
		const result = difference(featureCollection([cityBoundaryPolygon, buffered]));
		return result as Feature<Polygon | MultiPolygon>;
	}
}

/**
 * Get boundary for same-airport question using proper Voronoi partitioning
 * Creates regions where all points are closest to the same airport as the player
 */
function getSameAirportBoundary(
	playerLat: number,
	playerLng: number,
	airportLocations: Array<{ lat: number, lng: number, name: string }>,
	hasSameAirport: boolean
): Feature<Polygon | MultiPolygon> {
	if (airportLocations.length === 0) {
		console.error('No airports provided');
		return cityBoundaryPolygon;
	}

	// Find player's nearest airport
	let nearestAirportToPlayer = airportLocations[0];
	let minDistanceToPlayer = calculateDistance(
		playerLat,
		playerLng,
		nearestAirportToPlayer.lat,
		nearestAirportToPlayer.lng
	);

	for (const airport of airportLocations) {
		const dist = calculateDistance(playerLat, playerLng, airport.lat, airport.lng);
		if (dist < minDistanceToPlayer) {
			minDistanceToPlayer = dist;
			nearestAirportToPlayer = airport;
		}
	}

	// Create a grid of points and determine which belong to the same Voronoi cell
	const gridResolution = 0.002; // ~200m resolution for accurate Voronoi
	const matchingPoints: Array<[number, number]> = [];

	for (let lng = VästeråsExtremities.left; lng <= VästeråsExtremities.right; lng += gridResolution) {
		for (let lat = VästeråsExtremities.bottom; lat <= VästeråsExtremities.top; lat += gridResolution) {
			const testPoint = point([lng, lat]);

			// Skip if outside city boundary
			if (!booleanPointInPolygon(testPoint, cityBoundaryPolygon)) {
				continue;
			}

			// Find nearest airport to this grid point
			let nearestToPoint = airportLocations[0];
			let minDistToPoint = calculateDistance(lat, lng, nearestToPoint.lat, nearestToPoint.lng);

			for (const airport of airportLocations) {
				const dist = calculateDistance(lat, lng, airport.lat, airport.lng);
				if (dist < minDistToPoint) {
					minDistToPoint = dist;
					nearestToPoint = airport;
				}
			}

			// Check if this point has same nearest airport as player
			const isSameAirport = nearestToPoint.name === nearestAirportToPlayer.name;

			if ((hasSameAirport && isSameAirport) || (!hasSameAirport && !isSameAirport)) {
				matchingPoints.push([lng, lat]);
			}
		}
	}

	// If no matching points found, return empty intersection
	if (matchingPoints.length === 0) {
		console.warn('No matching points found for airport boundary');
		// Return a very small polygon that effectively excludes everything
		const emptyResult = difference(featureCollection([
			cityBoundaryPolygon,
			cityBoundaryPolygon
		]));
		return emptyResult || cityBoundaryPolygon;
	}

	// Create small buffers around each matching point and union them
	// This creates an approximate Voronoi region
	const bufferRadius = gridResolution * 111; // Convert degrees to km (approx)
	let resultBoundary: Feature<Polygon | MultiPolygon> | null = null;

	// Sample points to avoid creating too many buffers (performance optimization)
	const samplingRate = Math.max(1, Math.floor(matchingPoints.length / 500));

	for (let i = 0; i < matchingPoints.length; i += samplingRate) {
		const [lng, lat] = matchingPoints[i];
		const pointFeature = point([lng, lat]);
		const buffered = buffer(pointFeature, bufferRadius, { units: 'kilometers' });

		if (!buffered) continue;

		if (resultBoundary === null) {
			resultBoundary = buffered as Feature<Polygon | MultiPolygon>;
		} else {
			// Union with existing boundary
			const unioned = union(featureCollection([resultBoundary, buffered]));
			if (unioned) {
				resultBoundary = unioned as Feature<Polygon | MultiPolygon>;
			}
		}
	}

	// Intersect with city boundary
	if (resultBoundary) {
		const finalResult = intersect(featureCollection([cityBoundaryPolygon, resultBoundary]));
		return finalResult as Feature<Polygon | MultiPolygon>;
	}

	return cityBoundaryPolygon;
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
						? getAreaRightOfPlayer(playerLng)
						: getAreaLeftOfPlayer(playerLng),
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
				if (!airportLocations || airportLocations.length === 0) {
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
