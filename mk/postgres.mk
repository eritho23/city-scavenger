# mk/postgres.mk
.POSIX:
.PHONY: \
	migrate-down \
	migrate-up \
	postgres \
	postgres-clean \
	postgres-kill \
	psql

clean: postgres-clean

psql: postgres
	psql -U cityscav postgresql:///cityscav?host=$$(readlink ./tmp)

migrate-up: postgres
	migrate -path ./migrations -database postgresql://cityscav@/cityscav?host=$$(readlink ./tmp) up

migrate-down: postgres
	migrate -path ./migrations -database postgresql://cityscav@/cityscav?host=$$(readlink ./tmp) down

./tmp/.pgdata: ./tmp
	initdb \
		--username=cityscav \
		-D ./tmp/.pgdata \
		--auth-local=trust

postgres: ./tmp/.pgdata
	if [ ! -f ./tmp/.pgdata/postmaster.pid ]; then \
		pg_ctl -D ./tmp/.pgdata start -o "-c unix_socket_directories=$$(pwd)/tmp -c listen_addresses=''"; \
		psql -h $$(readlink ./tmp) -U cityscav postgres -c "CREATE DATABASE cityscav;" 2>/dev/null || true; \
	fi

postgres-kill:
	if [ -f ./tmp/.pgdata/postmaster.pid ]; then \
		kill $$(head -n1 ./tmp/.pgdata/postmaster.pid); \
	fi

postgres-clean: postgres-kill
	rm -rf ./tmp/postgres ./tmp/.pgdata