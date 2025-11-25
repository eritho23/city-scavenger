import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "$env/dynamic/private";
import type { DB } from "./generated/db";

const dialect = new PostgresDialect({
	pool: new Pool({
		database: env.PGDATABASE,
		host: env.PGHOST,
		user: env.PGUSERNAME,
		port: 5432,
		max: 5,
	}),
});

export const db = new Kysely<DB>({
	dialect,
});
