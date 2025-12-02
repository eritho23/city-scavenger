<script lang="ts">
  import { parse } from 'valibot';
  import { PlaceProfile } from '$lib/schemas';
  let { data } = $props()

  let parsedPlaceProfile = $derived(parse(PlaceProfile, data.game.place_profile))

</script>

<h1>Game {data.game.uid}</h1>

Place profile
<pre><code>
  {JSON.stringify(parsedPlaceProfile)}
</code></pre>
