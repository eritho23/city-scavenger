import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";
import type { DB } from "./generated/db.d.ts";

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: env.DATABASE_URL,
		port: 5432,
		max: 5,
	}),
});

export const db = new Kysely<DB>({
	dialect,
});
