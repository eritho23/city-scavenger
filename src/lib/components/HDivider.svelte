<script lang="ts">
	interface Props {
		class?: string;
	}

	let props: Props = $props();
</script>

<div class={`h-0.5 w-full rounded-full bg-text-200 ${props.class}`}></div>
