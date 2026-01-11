import json
import math
import re
from sys import argv
import os


def distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in meters.
    R = 6371000
    # Convert degrees into radians.
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    # Calculate distance between nodes.
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def sort_route_key(line):
    """Sort key for bus lines that handles numeric + alphanumeric (e.g., '111A')"""
    match = re.match(r"(\d+)([A-Z]*)", line)
    if match:
        return (int(match.group(1)), match.group(2))
    return (float("inf"), line)  # fallback for non-standard formats


if not os.path.exists(argv[1]):
    print("Input path does not exist: {}".format(argv[1]))
    exit(1)

with open(argv[1]) as f:
    data = json.load(f)

stops = [e for e in data["elements"] if e["type"] == "node"]

by_name = {}
for s in stops:
    name = s.get("tags", {}).get("name", f"_{s['id']}")
    by_name.setdefault(name, []).append(s)

grouped = []
for name, stops in by_name.items():
    used = set()
    for i, s in enumerate(stops):
        if i in used:
            continue
        cluster = [s]
        used.add(i)
        for j, other in enumerate(stops):
            if (
                j not in used
                and distance(s["lat"], s["lon"], other["lat"], other["lon"]) < 50
            ):
                cluster.append(other)
                used.add(j)

        # Merge route_refs from all stops in the cluster
        route_refs = set()
        for stop in cluster:
            route_ref = stop.get("tags", {}).get("route_ref")
            if route_ref:
                route_refs.update(route_ref.split(";"))

        merged_route_ref = (
            ";".join(sorted(route_refs, key=sort_route_key)) if route_refs else ""
        )

        # Preserve original tags and add merged route_ref
        merged_tags = cluster[0].get("tags", {}).copy()
        if merged_route_ref:
            merged_tags["route_ref"] = merged_route_ref

        grouped.append(
            {
                "type": "node",
                "id": cluster[0]["id"],
                "lat": sum(c["lat"] for c in cluster) / len(cluster),
                "lon": sum(c["lon"] for c in cluster) / len(cluster),
                "tags": merged_tags,
            }
        )

with open(argv[1], "w") as f:
    json.dump({"elements": grouped}, f, indent=2)

print(f"{len(data['elements'])} -> {len(grouped)}")
