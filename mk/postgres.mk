.POSIX:

.PHONY: \
	postgres \
	postgres-clean \
	postgres-kill \
	psql

clean: postgres-clean

psql:
	psql -U cityscav postgresql:///postgres?host=$(readlink ./tmp)

./tmp/.pgdata: ./tmp
	initdb \
		--username=cityscav \
		-D ./tmp/.pgdata \
		--auth-local=trust

postgres: ./tmp/.pgdata
	pg_ctl -D ./tmp/.pgdata start -o "-c unix_socket_directories=$$(pwd)/tmp -c listen_addresses=''"

postgres-kill:
	if [ -f ./tmp/.pgdata/postmaster.pid ]; then \
		kill $$(head -n1 ./tmp/.pgdata/postmaster.pid); \
	fi

postgres-clean: postgres-kill
	rm -rf ./tmp/postgres ./tmp/.pgdata
