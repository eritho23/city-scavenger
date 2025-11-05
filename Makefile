.POSIX:

.PHONY: \
	geodata \
	clean

generated:
	-mkdir -p ./generated

generated/busstops-raw.geojson: generated
	curl \
		--fail \
		--request POST \
		--header "Content-Type: application/x-www-form-urlencoded" \
		--data @queries/busstops.query \
		'https://overpass-api.de/api/interpreter' \
		--output generated/busstops-raw.geojson

generated/busstops-merged.geojson: generated/busstops-raw.geojson
	python3 \
		./scripts/merge_busstops.py \
		$$(realpath ./generated/busstops-raw.geojson) \
		"$$(realpath .)/generated/busstops-merged.geojson"

geodata: generated/busstops-merged.geojson

clean:
	rm -rf ./generated