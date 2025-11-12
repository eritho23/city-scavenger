# Makefile
.POSIX:

.PHONY: \
	clean

clean:

# Include Makefile modules.
include mk/dev.mk
include mk/geodata.mk