# mk/geodata.mk
.POSIX:

.PHONY: \
	geodata \
	geodata-clean

clean: geodata-clean

# OVERPASS_API_ENDPOINT = https://overpass-api.de/api/interpreter
OVERPASS_API_ENDPOINT = https://overpass.kumi.systems/api/interpreter

static/generated:
	mkdir -p ./static/generated

static/generated/busstops-raw.geojson: static/generated queries/busstops.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/busstops.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

static/generated/pizzerias.geojson: static/generated queries/pizzerias.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/pizzerias.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

static/generated/pharmacies.geojson: static/generated queries/pharmacies.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/pharmacies.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

static/generated/busstops-merged.geojson: static/generated/busstops-raw.geojson
	python3 \
		./scripts/merge_busstops.py \
		$$(realpath ./static/generated/busstops-raw.geojson) \
		"$$(realpath .)/static/generated/busstops-merged.geojson"

geodata: \
	static/generated/busstops-merged.geojson \
	static/generated/pharmacies.geojson \
	static/generated/pizzerias.geojson

geodata-clean:
	rm -rf ./static/generated