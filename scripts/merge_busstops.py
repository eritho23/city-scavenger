import json
import math
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
        grouped.append(
            {
                "type": "node",
                "id": cluster[0]["id"],
                "lat": sum(c["lat"] for c in cluster) / len(cluster),
                "lon": sum(c["lon"] for c in cluster) / len(cluster),
                "tags": cluster[0].get("tags", {}),
            }
        )

with open(argv[1], "w") as f:
    json.dump({"elements": grouped}, f, indent=2)

print(f"{len(data['elements'])} -> {len(grouped)}")
