<script lang="ts">
	export let score: number = 0;
	export let time: string = "00:00:00";
	export let onMenuClick: (isOpen: boolean) => void = () => {};

	import { goto } from "$app/navigation";

	let showMenu = false;

	function toggleMenu() {
		showMenu = !showMenu;
		onMenuClick(showMenu);
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

<div class="bg-white px-4 py-2 border-b border-gray-200 relative">
	<div class="flex justify-between items-center">
		<span class="text-sm font-semibold text-gray-800">{score} poäng</span>

		<span class="text-sm font-semibold text-gray-800">{time}</span>

		<div class="relative">
			<button
				onclick={toggleMenu}
				class="text-xl text-gray-700 hover:opacity-70 transition-opacity"
				>☰</button
			>
			{#if showMenu}
				<div
					class="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-50"
					style="animation: slideInFromTop 200ms ease-out;"
				>
					<button
						onclick={() => {
							closeMenu();
							goto("/");
						}}
						class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
					>
						Hem
					</button>
					<button
						onclick={() => {
							closeMenu();
							goto("/history");
						}}
						class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
					>
						Historik
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@keyframes slideInFromTop {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
