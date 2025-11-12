.POSIX:

.PHONY: \
	clean \
	dev \
	geodata

OVERPASS_API_ENDPOINT = https://overpass-api.de/api/interpreter

generated:
	-mkdir -p ./generated

generated/busstops-raw.geojson: generated queries/busstops.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/busstops.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

generated/pizzerias.geojson: generated queries/pizzerias.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/pizzerias.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

generated/pharmacies.geojson: generated queries/pharmacies.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/pharmacies.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

generated/busstops-merged.geojson: generated/busstops-raw.geojson
	python3 \
		./scripts/merge_busstops.py \
		$$(realpath ./generated/busstops-raw.geojson) \
		"$$(realpath .)/generated/busstops-merged.geojson"

geodata: \
	generated/busstops-merged.geojson \
	generated/pharmacies.geojson \
	generated/pizzerias.geojson

clean:
	rm -rf ./generated ./build ./node_modules

dev:
	bun --bun run dev
