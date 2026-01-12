<script lang="ts">
	import L from "leaflet";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { VästeråsLatLng } from "$lib/constants/coords";

	interface Props {
		coords: { lat: number; lng: number };
	}

	let { coords }: Props = $props();
	let mapEl: HTMLElement;
	let map: L.Map | undefined;
	let userMarker: L.Marker | undefined;

	$effect(() => {
		if (map !== undefined) {
			if (userMarker !== undefined) userMarker.remove();

			userMarker = new L.Marker([coords.lat, coords.lng]);
			userMarker.addTo(map);
		}
	});

	onMount(async () => {
		if (browser && window) {
			map = L.map(mapEl, {
				zoomControl: false,
			}).setView(VästeråsLatLng, 12);

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			}).addTo(map);

			map.locate({ setView: true, maxZoom: 16 });

			map.on("locationfound", () => {});

			map.on("locationerror", () => {});

			userMarker = new L.Marker([coords.lat, coords.lng]);
			userMarker.addTo(map);
		}
	});
</script>

<div bind:this={mapEl} class="w-full h-full"></div>
