import type { RequestEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { pg } from "$lib/db";


export const load: PageServerLoad = async (_: RequestEvent) => {
  let one = await pg`select 1;`.values()
  console.log(one)

  return {
    one
  }
}
