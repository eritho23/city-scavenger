.POSIX:
.PHONY: \
	migrate-down \
	migrate-up \
	postgres \
	postgres-clean \
	postgres-kill \
	psql

clean: postgres-clean

psql:
	psql -U cityscav postgresql:///cityscav?host=$$(readlink ./tmp)

migrate-up:
	migrate -path ./migrations -database postgresql:///cityscav?host=$$(readlink ./tmp) up

migrate-down:
	migrate -path ./migrations -database postgresql:///cityscav?host=$$(readlink ./tmp) down

./tmp/.pgdata: ./tmp
	initdb \
		--username=cityscav \
		-D ./tmp/.pgdata \
		--auth-local=trust

postgres: ./tmp/.pgdata
	pg_ctl -D ./tmp/.pgdata start -o "-c unix_socket_directories=$$(pwd)/tmp -c listen_addresses=''"
	createdb -h $$(readlink ./tmp) -U cityscav cityscav 2>/dev/null || true

postgres-kill:
	if [ -f ./tmp/.pgdata/postmaster.pid ]; then \
		kill $$(head -n1 ./tmp/.pgdata/postmaster.pid); \
	fi

postgres-clean: postgres-kill
	rm -rf ./tmp/postgres ./tmp/.pgdata