<script lang="ts">
  export let currentType: number = 0;
  export let onDotClick: (index: number) => void = () => {};

  const dotColors = ["bg-blue-500", "bg-yellow-300", "bg-green-300", "bg-purple-300", "bg-pink-300"];
</script>

<div class="relative w-full h-96 bg-gray-300">
  <img src="https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/16.5411,59.3293,14,400x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycW1vdnJqcW1jNDgifQ.rJcFIG214AriISLbB6B5aw" alt="Map" class="w-full h-full object-cover" />
  <button aria-label="Expand map" class="absolute top-3 right-3 bg-white w-9 h-9 flex items-center justify-center rounded shadow-md hover:bg-gray-50">
    ⛶
  </button>
  <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
    {#each dotColors as color, i}
      <button
        on:click={() => onDotClick(i)}
        aria-label="Question type {i + 1}"
        class="transition-all duration-300 {color} rounded-full {currentType === i ? 'w-8 h-2' : 'w-2 h-2'}"
      />
    {/each}
  </div>
</div>