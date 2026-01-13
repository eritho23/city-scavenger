<script lang="ts">
	import { MapStyle, MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
	import { difference, featureCollection } from "@turf/turf";
	import type { Feature, LineString, MultiPolygon, Polygon } from "geojson";
	import L, { type LatLng } from "leaflet";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { VästeråsBounds, VästeråsLatLng } from "$lib/constants/coords";
	import { cityBoundaryPolygon } from "$lib/map-functions";

	let mapEl: HTMLElement;
	let map: L.Map | undefined = $state(undefined);
	let userMarker: L.CircleMarker | undefined;
	let currentPosition = $state(L.latLng(VästeråsLatLng.lat, VästeråsLatLng.lng));

	// Layer for drawing boundaries (excluded areas)
	let boundaryLayer: L.GeoJSON | undefined;
	let dividerLayer: L.GeoJSON | undefined;

	interface Props {
		positionCallback?: (pos: LatLng) => void;
		boundary?: Feature<Polygon | MultiPolygon> | null;
		boundaryLines?: Feature<LineString>[] | null;
		boundaryStyle?: {
			fillColor?: string;
			color?: string;
			fillOpacity?: number;
			weight?: number;
		};
		showBoundaryLines?: boolean;
	}

	let {
		positionCallback,
		boundary = null,
		boundaryLines = [],
		boundaryStyle = {
			fillColor: "#1f2937",
			color: "#111827",
			fillOpacity: 0.2,
			weight: 1,
		},
		showBoundaryLines = true,
	}: Props = $props();

	// Update boundary layer when boundary prop changes
	$effect(() => {
		// Access boundary first to ensure it's tracked for reactivity
		const currentBoundary = boundary;
		const currentBoundaryLines = boundaryLines ?? [];
		const currentMap = map;
		const shouldShowDividerLines = showBoundaryLines && currentBoundaryLines.length > 0;

		console.log("[Map] $effect triggered, map:", !!currentMap, "boundary:", currentBoundary);

		if (!currentMap) {
			console.log("[Map] Map not ready yet, skipping boundary update");
			return;
		}

		// Remove existing boundary layer
		if (boundaryLayer) {
			console.log("[Map] Removing existing boundary layer");
			boundaryLayer.remove();
			boundaryLayer = undefined;
		}

		if (dividerLayer) {
			console.log("[Map] Removing existing divider lines");
			dividerLayer.remove();
			dividerLayer = undefined;
		}

		// Add new boundary if provided - we invert it to shade the EXCLUDED area
		if (currentBoundary) {
			console.log("[Map] Computing excluded area (inverse of valid boundary)");
			try {
				// Compute the excluded area by subtracting the valid boundary from the city boundary
				const excludedArea = difference(featureCollection([cityBoundaryPolygon, currentBoundary]));

				if (excludedArea) {
					console.log("[Map] Drawing excluded area:", JSON.stringify(excludedArea).substring(0, 200));
					boundaryLayer = L.geoJSON(excludedArea, {
						style: {
							fillColor: boundaryStyle.fillColor,
							color: boundaryStyle.color,
							fillOpacity: boundaryStyle.fillOpacity,
							weight: boundaryStyle.weight,
						},
					}).addTo(currentMap);
					console.log("[Map] Excluded area layer added successfully");
				} else {
					console.log("[Map] No excluded area to draw (entire city is valid)");
				}
			} catch (err) {
				console.error("[Map] Error adding excluded area:", err);
			}
		} else {
			console.log("[Map] No boundary to add");
		}

		if (shouldShowDividerLines) {
			try {
				const lineCollection = featureCollection(currentBoundaryLines);
				dividerLayer = L.geoJSON(lineCollection, {
					style: {
						color: "#fef08a",
						weight: 2,
						dashArray: "8 6",
					},
					interactive: false,
				}).addTo(currentMap);
				console.log("[Map] Divider lines drawn:", currentBoundaryLines.length);
			} catch (err) {
				console.error("[Map] Error drawing divider lines:", err);
			}
		} else {
			console.log("[Map] Divider lines hidden");
		}
	});

	onMount(async () => {
		if (browser && window) {
			map = L.map(mapEl, {
				zoomControl: false,
			}).setView(currentPosition, 12);

			new MaptilerLayer({
				apiKey: "TCMrUvyOBWQMOhVUBdg6",
				style: MapStyle.STREETS,
			}).addTo(map);

			map.locate({ maxZoom: 16, watch: true, setView: false });

			map.on("locationfound", (e) => {
				console.log("Location found:", e.latlng);
				if (positionCallback) positionCallback(e.latlng);
				currentPosition = e.latlng;
				// if (map) map.setView(e.latlng, 16);
				if (userMarker !== undefined) userMarker.remove();

				userMarker = L.circleMarker(e.latlng, {
					radius: 4,
					fillColor: "lightGreen",
					color: "green",
					fillOpacity: 0.8,
					weight: 2,
				});
				if (map) userMarker.addTo(map);
			});

			map.on("locationerror", (e) => {
				console.warn("Location access denied or unavailable", e);
			});

			L.rectangle(VästeråsBounds, {
				fillColor: "red",
				color: "darkred",
				fillOpacity: 0.1,
				weight: 2,
				dashArray: "5, 10",
			}).addTo(map);

			console.log("[Map] Map initialized, boundary prop is:", boundary);
		}
	});
</script>

<div bind:this={mapEl} class="w-full h-full"></div>
