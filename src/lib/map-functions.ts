import { VästeråsExtremities } from "$lib/constants/coords";
import { bboxPolygon, booleanPointInPolygon, polygon, intersect, featureCollection } from "@turf/turf";
import { point } from "@turf/helpers";
import type { Feature, Polygon } from "geojson";

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
export function getAreaAbovePlayer(playerLat: number, _playerLng: number): Feature<Polygon> {
	// Create polygon covering area north of player
	const northPolygon = polygon([[
		[VästeråsExtremities.left, playerLat],
		[VästeråsExtremities.right, playerLat],
		[VästeråsExtremities.right, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.top],
		[VästeråsExtremities.left, playerLat]
	]]);
	
	// Intersect with city boundary
	const result = intersect(featureCollection([cityBoundaryPolygon, northPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get the area below the player (south of player's position)
 */
export function getAreaBelowPlayer(playerLat: number, _playerLng: number): Feature<Polygon> {
	// Create polygon covering area south of player
	const southPolygon = polygon([[
		[VästeråsExtremities.left, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, playerLat],
		[VästeråsExtremities.left, playerLat],
		[VästeråsExtremities.left, VästeråsExtremities.bottom]
	]]);
	
	// Intersect with city boundary
	const result = intersect(featureCollection([cityBoundaryPolygon, southPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get the area to the left of player (west of player's position)
 */
export function getAreaLeftOfPlayer(playerLat: number, playerLng: number): Feature<Polygon> {
	// Create polygon covering area west of player
	const westPolygon = polygon([[
		[VästeråsExtremities.left, VästeråsExtremities.bottom],
		[playerLng, VästeråsExtremities.bottom],
		[playerLng, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.bottom]
	]]);
	
	// Intersect with city boundary
	const result = intersect(featureCollection([cityBoundaryPolygon, westPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get the area to the right of player (east of player's position)
 */
export function getAreaRightOfPlayer(playerLat: number, playerLng: number): Feature<Polygon> {
	// Create polygon covering area east of player
	const eastPolygon = polygon([[
		[playerLng, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.top],
		[playerLng, VästeråsExtremities.top],
		[playerLng, VästeråsExtremities.bottom]
	]]);
	
	// Intersect with city boundary
	const result = intersect(featureCollection([cityBoundaryPolygon, eastPolygon]));
	return result as Feature<Polygon>;
}

/**
 * Get quadrants around player (NE, NW, SE, SW)
 */
export function getQuadrants(playerLat: number, playerLng: number) {
	const northEast = polygon([[
		[playerLng, playerLat],
		[VästeråsExtremities.right, playerLat],
		[VästeråsExtremities.right, VästeråsExtremities.top],
		[playerLng, VästeråsExtremities.top],
		[playerLng, playerLat]
	]]);
	
	const northWest = polygon([[
		[VästeråsExtremities.left, playerLat],
		[playerLng, playerLat],
		[playerLng, VästeråsExtremities.top],
		[VästeråsExtremities.left, VästeråsExtremities.top],
		[VästeråsExtremities.left, playerLat]
	]]);
	
	const southEast = polygon([[
		[playerLng, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, VästeråsExtremities.bottom],
		[VästeråsExtremities.right, playerLat],
		[playerLng, playerLat],
		[playerLng, VästeråsExtremities.bottom]
	]]);
	
	const southWest = polygon([[
		[VästeråsExtremities.left, VästeråsExtremities.bottom],
		[playerLng, VästeråsExtremities.bottom],
		[playerLng, playerLat],
		[VästeråsExtremities.left, playerLat],
		[VästeråsExtremities.left, VästeråsExtremities.bottom]
	]]);
	
	return {
		northEast: intersect(featureCollection([cityBoundaryPolygon, northEast])) as Feature<Polygon>,
		northWest: intersect(featureCollection([cityBoundaryPolygon, northWest])) as Feature<Polygon>,
		southEast: intersect(featureCollection([cityBoundaryPolygon, southEast])) as Feature<Polygon>,
		southWest: intersect(featureCollection([cityBoundaryPolygon, southWest])) as Feature<Polygon>,
	};
}

/**
 * Check if a point is within a specific boundary
 */
export function isPointInBoundary(lat: number, lng: number, boundary: Feature<Polygon>): boolean {
	const testPoint = point([lng, lat]);
	return booleanPointInPolygon(testPoint, boundary);
}

/**
 * Convert Turf polygon to Leaflet-compatible format
 */
export function turfToLeafletPolygon(turfPolygon: Feature<Polygon>): number[][][] {
	const coords = turfPolygon.geometry.coordinates;
	// Convert from [lng, lat] to [lat, lng] for Leaflet
	return coords.map((ring: number[][]) => ring.map((coord: number[]) => [coord[1], coord[0]]));
}

/**
 * Get all boundary types for a player position
 */
export function getAllBoundaries(playerLat: number, playerLng: number) {
	return {
		fullCity: cityBoundaryPolygon,
		above: getAreaAbovePlayer(playerLat, 0),
		below: getAreaBelowPlayer(playerLat, 0),
		left: getAreaLeftOfPlayer(playerLat, playerLng),
		right: getAreaRightOfPlayer(playerLat, playerLng),
		quadrants: getQuadrants(playerLat, playerLng),
	};
}