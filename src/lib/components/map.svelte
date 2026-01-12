<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	import { VästeråsLatLng, VästeråsBounds } from "$lib/constants/coords";

	let mapEl: HTMLElement;
	let playerMarker: any;

	onMount(async () => {
		if (browser && window) {
			const L = (await import("leaflet")).default;

			const map = L.map(mapEl, {
				zoomControl: false,
			}).setView(VästeråsLatLng, 12);

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			}).addTo(map);

			map.locate({ maxZoom: 16, watch: true });

			map.on("locationfound", (e: any) => {
				if (playerMarker) {
					map.removeLayer(playerMarker);
				}
				
				playerMarker = L.circleMarker(e.latlng, { 
					radius: 8, 
					fillColor: "green", 
					color: "darkgreen", 
					fillOpacity: 0.8,
					weight: 2
				}).addTo(map);
			});

			map.on("locationerror", () => {
				console.warn("Location access denied or unavailable");
			});

			L.rectangle(VästeråsBounds, { 
				fillColor: "red", 
				color: "darkred", 
				fillOpacity: 0.1,
				weight: 2,
				dashArray: "5, 10"
			}).addTo(map);
		}
	});
</script>

<div bind:this={mapEl} class="w-full h-full"></div>
