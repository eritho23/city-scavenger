<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	import { VästeråsLatLng } from "$lib/constants/coords";

	let mapEl: HTMLElement;

	onMount(async () => {
		if (browser) {
			const L = (await import("leaflet")).default;

			const map = L.map(mapEl, {
				zoomControl: false,
			}).setView(VästeråsLatLng, 12);

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
			}).addTo(map);

			map.locate({ setView: true, maxZoom: 16 });

			map.on("locationfound", () => {});

			map.on("locationerror", () => {});
		}
	});
</script>

<div bind:this={mapEl} class="w-full h-full"></div>
