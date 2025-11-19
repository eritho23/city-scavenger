# Makefile
.POSIX:

.PHONY: \
	clean \
	clean-tmp

clean: \
	clean-tmp

clean-tmp:
	rm -rf $$(readlink ./tmp)
	unlink ./tmp

./tmp:
	ln -sf $$(mktemp -d) ./tmp

# Include Makefile modules.
include mk/dev.mk
include mk/geodata.mk
include mk/postgres.mk