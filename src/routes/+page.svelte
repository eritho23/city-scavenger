<script lang="ts">
  import type { PageProps } from './$types';
  import { invalidate } from '$app/navigation';
  let {form, data}: PageProps = $props();
  
  if (form?.success) {
    invalidate('data:success')
  }
</script>

<form method="POST">
  <input type="text" name="bus_stop" placeholder="Bus stop" />
  <input type="submit" value="Create game">
</form>

<ul>
  {#each data.games as game}
    <li>
      {game.uid}
    </li>
  {/each}
</ul>

<h1>Games</h1>
