<script lang="ts">
  import { resolve } from '$app/paths';
import type { PageProps } from './$types';
  let {form, data}: PageProps = $props();
</script>

<form method="POST">
  <input type="text" name="bus_stop" placeholder="Bus stop" />
  <input type="submit" value="Create game">
</form>

<span>
  {#if form?.success}
    Submitted successfully
  {:else if form?.message}
    {form?.message}
  {/if}
</span>

<h1>Games</h1>

<ul>
  {#each data.games as game, index (index)}
    <li>
      <a href={resolve(`/game/${game.uid.toString()}`)}>{index} - {game.uid}</a>
    </li>
  {/each}
</ul>

