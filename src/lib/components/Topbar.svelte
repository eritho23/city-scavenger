<script lang="ts">
	import { slide } from "svelte/transition";
	import { afterNavigate } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import logo from "$lib/assets/city-scav-logo.svg";
	import { currentGame } from "$lib/stores/game.svelte";
	import HDivider from "./HDivider.svelte";

	let isMenuOpen = $state(false);

	function toggleNav() {
		isMenuOpen = !isMenuOpen;
	}

	afterNavigate(() => {
		isMenuOpen = false;
	});
</script>

<div class="w-full fixed left-0 px-3 z-50">
	<header
		class="w-full overflow-hidden bg-bg-800 rounded-3xl px-6 py-2 transition-[height] duration-300 ease-in-out"
		class:bg-bg-900={page.url.pathname.includes("/game")}
	>
		<div class="flex justify-between items-center">
			{#if page.url.pathname.includes("/game")}
				<div class="flex items-center gap-3">
					<span>{currentGame.score > 0 ? "+" : ""}{currentGame.score}</span>
					<HDivider class="w-4!" />
					<span>{currentGame.time}</span>
				</div>
			{:else}
				<a href={resolve("/")}>
					<img src={logo} alt="City Scavenger-logotyp" class="h-4.5" />
				</a>
			{/if}
			<div>
				<button
					onclick={() => toggleNav()}
					class:open={isMenuOpen}
					aria-label="Menu toggle"
					aria-expanded={isMenuOpen}
				>
					<div class="icon pointer-events-none"></div>
				</button>
			</div>
		</div>
		{#if isMenuOpen}
			<div
				in:slide={{ duration: 300 }}
				out:slide={{ duration: 300 }}
				class="my-4 flex flex-col gap-1 text-xl pl-3"
			>
				<a href={resolve("/")}>Hem</a>
				<a href={resolve("/history")}>Spelhistorik</a>
			</div>
		{/if}
	</header>
</div>

<style>
	button {
		--btn-size: 24px;
		--line-height: 2px;
		--line-spacing: 6px;
		--translate: calc(var(--btn-size) * 0.17);

		position: relative;
		width: var(--btn-size);
		height: var(--btn-size);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.icon {
		transition-duration: 0.3s;
		position: relative;
		width: var(--btn-size);
		height: var(--line-height);
		display: block;
		will-change: transform;
	}

	.icon::before,
	.icon::after {
		content: "";
		position: absolute;
		left: 0;
		width: 100%;
		height: var(--line-height);
		background-color: var(--color-text-100);
		border-radius: 2px;
		transition: 0.3s;
	}

	.icon::before {
		top: calc(-1 * var(--line-spacing));
	}

	button.open .icon {
		transition: 0.3s;
	}

	button.open .icon::before {
		transform: rotateZ(25deg)
			translate(calc(var(--translate) * 0.5), calc(var(--translate) * 0.5));
	}

	button.open .icon::after {
		transform: rotateZ(-25deg)
			translate(
				calc(var(--translate) * 0.5 + 0.5px),
				calc(var(--translate) * -0.5 - 0.5px)
			);
	}
</style>
