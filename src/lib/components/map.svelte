<script lang="ts">
	import { MapStyle, MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
	import L from "leaflet";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { VästeråsBounds, VästeråsLatLng } from "$lib/constants/coords";

	let mapEl: HTMLElement;
	let map: L.Map | undefined;
	let userMarker: L.CircleMarker | undefined;
	let currentPosition = $state(L.latLng(VästeråsLatLng.lat, VästeråsLatLng.lng));

	onMount(async () => {
		if (browser && window) {
			map = L.map(mapEl, {
				zoomControl: false,
			}).setView(currentPosition, 12);

			const tileLayer = new MaptilerLayer({
				apiKey: "TCMrUvyOBWQMOhVUBdg6",
				style: MapStyle.STREETS,
			}).addTo(map);

			map.locate({ maxZoom: 16, watch: true, setView: false });

			map.on("locationfound", (e) => {
				console.log("Location found:", e.latlng);
				currentPosition = e.latlng;
				// if (map) map.setView(e.latlng, 16);
				if (userMarker !== undefined) userMarker.remove();

				userMarker = L.circleMarker(e.latlng, {
					radius: 4,
					fillColor: "lightBlue",
					color: "blue",
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
		}
	});
</script>

<div bind:this={mapEl} class="w-full h-full"></div>
