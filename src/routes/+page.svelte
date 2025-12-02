<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageProps } from './$types';
  let {form, data}: PageProps = $props();
</script>

<form method="POST">
  <input type="text" name="busStop" placeholder="Bus stop" />
  <input type="number" step="0.01" name="lat" />
  <input type="number" step="0.01" name="lon" />
  <input type="number" name="elevation" />
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

