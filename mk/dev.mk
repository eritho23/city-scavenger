# mk/dev.mk
.POSIX:

.PHONY: \
	dev \
	dev-clean \
	gen-types \
	install-deps

clean: dev-clean

install-deps:
	bun install

gen-types: ./src/lib/generated/db.d.ts

./src/lib/generated/db.d.ts: migrate-up ./migrations/*.sql
	mkdir -p $$(dirname "$@")
	bun --bun run db:generate

dev: install-deps postgres ./src/lib/generated/db.d.ts
	bun --bun run dev

dev-clean:
	rm -rf ./build ./node_modules ./.svelte-kit
	rm -rf ./src/lib/generated