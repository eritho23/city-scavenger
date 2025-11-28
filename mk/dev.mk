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

MIGRATIONS ::= $(shell ls ./migrations/*.sql 2>/dev/null)
./src/lib/generated/db.d.ts: migrate-up $(MIGRATIONS)
	mkdir -p $$(dirname "$@")
	bun --bun run db:generate

dev: install-deps postgres ./src/lib/generated/db.d.ts
	bun --bun run dev

dev-clean:
	rm -rf ./build ./node_modules ./.svelte-kit
	rm -rf ./src/lib/generated