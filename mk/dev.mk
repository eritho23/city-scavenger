# mk/dev.mk
.POSIX:

.PHONY: \
	dev \
	dev-clean \
	install-deps

clean: dev-clean

install-deps:
	bun install

dev: install-deps postgres
	bun --bun run dev

dev-clean:
	rm -rf ./build ./node_modules
