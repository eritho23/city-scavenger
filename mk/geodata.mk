# mk/geodata.mk
.POSIX:

.PHONY: \
	geodata

# OVERPASS_API_ENDPOINT = https://overpass-api.de/api/interpreter
OVERPASS_API_ENDPOINT = https://overpass.kumi.systems/api/interpreter

static/geodata:
	mkdir -p ./static/geodata

static/geodata/busstops-raw.geojson: static/geodata queries/busstops.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/busstops.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

static/geodata/pizzerias.geojson: static/geodata queries/pizzerias.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/pizzerias.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

static/geodata/pharmacies.geojson: static/geodata queries/pharmacies.query
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/pharmacies.query \
		$(OVERPASS_API_ENDPOINT) \
		--output "$@"

static/geodata/busstops-merged.geojson: static/geodata/busstops-raw.geojson
	python3 \
		./scripts/merge_busstops.py \
		$$(realpath ./static/geodata/busstops-raw.geojson) \
		"$$(realpath .)/static/geodata/busstops-merged.geojson"

geodata: \
	static/geodata/busstops-merged.geojson \
	static/geodata/pharmacies.geojson \
	static/geodata/pizzerias.geojson