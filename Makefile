# Makefile
.POSIX:

.PHONY: \
	clean \
	clean-disk-images \
	clean-tmp

clean: postgres-kill postgres-clean dev-clean geodata-clean clean-tmp clean-disk-images

clean-disk-images:
	rm -f *.qcow2

clean-tmp: postgres-clean
	if [ -L ./tmp ]; then rm -rf $$(readlink ./tmp); unlink ./tmp; fi

./tmp:
	ln -sf $$(mktemp -d) ./tmp

# Include Makefile modules.
include mk/dev.mk
include mk/geodata.mk
include mk/postgres.mk