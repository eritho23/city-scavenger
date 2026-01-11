<script lang="ts">
	import { onMount } from "svelte";

	let mapEl: HTMLElement;

	onMount(async () => {
		const L = (await import("leaflet")).default;

		const map = L.map(mapEl, {
			zoomControl: false,
		}).setView([51.505, -0.09], 13);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
		}).addTo(map);

		map.locate({ setView: true, maxZoom: 16 });

		map.on("locationfound", () => {});

		map.on("locationerror", () => {});
	});
</script>

<div bind:this={mapEl} class="w-full h-full"></div>
