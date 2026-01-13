import { point } from "@turf/helpers";
import { lineString, nearestPointOnLine } from "@turf/turf";
import type { Feature, LineString as TurfLineString, MultiPolygon, Point, Polygon } from "geojson";
import { calculateDistance } from "$lib/distance";

export function getDistanceToFeature(
	pointLat: number,
	pointLng: number,
	feature: Feature,
): number {
	const testPoint = point([pointLng, pointLat]);

	switch (feature.geometry.type) {
		case "Point": {
			const featurePoint = feature as Feature<Point>;
			return calculateDistance(
				pointLat,
				pointLng,
				featurePoint.geometry.coordinates[1],
				featurePoint.geometry.coordinates[0],
			);
		}
		case "LineString": {
			const nearest = nearestPointOnLine(feature as Feature<TurfLineString>, testPoint);
			return calculateDistance(
				pointLat,
				pointLng,
				nearest.geometry.coordinates[1],
				nearest.geometry.coordinates[0],
			);
		}
		case "Polygon": {
			const coords = (feature as Feature<Polygon>).geometry.coordinates[0] as number[][];
			const line = lineString(coords);
			const nearest = nearestPointOnLine(line, testPoint);
			return calculateDistance(
				pointLat,
				pointLng,
				nearest.geometry.coordinates[1],
				nearest.geometry.coordinates[0],
			);
		}
		case "MultiPolygon": {
			let minDistance = Infinity;
			const multiPoly = (feature as Feature<MultiPolygon>).geometry.coordinates;

			for (const poly of multiPoly) {
				const coords = poly[0] as number[][];
				const line = lineString(coords);
				const nearest = nearestPointOnLine(line, testPoint);
				const distance = calculateDistance(
					pointLat,
					pointLng,
					nearest.geometry.coordinates[1],
					nearest.geometry.coordinates[0],
				);
				minDistance = Math.min(minDistance, distance);
			}

			return minDistance;
		}
		default:
			throw new Error(`Unsupported geometry type: ${feature.geometry.type}`);
	}
}
