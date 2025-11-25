<script lang="ts">
  import { parse } from 'valibot';
  import { PlaceProfile } from '$lib/schemas';
  let { data } = $props()
  $inspect(data.game)

  let parsedPlaceProfile = $derived(parse(PlaceProfile, data.game.place_profile))

</script>

<h1>Game {data.game.uid}</h1>

Final bus stop: {parsedPlaceProfile.busStop}
