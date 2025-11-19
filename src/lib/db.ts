import { SQL } from "bun";

export const pg = new SQL({
  max: 1,
  onconnect: _ => {
    console.log("Database connected.")
  }
})

await pg.connect()
