import json
import os

# ✅ global counter
_index = 0


def get_argo_float():
    global _index   # VERY IMPORTANT

    path = os.path.join(
        os.path.dirname(__file__),
        "argo_sample.json"
    )

    with open(path, "r") as f:
        data = json.load(f)

    rows = data["table"]["rows"]

    # ✅ safety check
    if len(rows) == 0:
        return {"error": "No ARGO data found"}

    # ✅ keep index inside range
    _index = _index % len(rows)

    row = rows[_index]

    # ✅ move to next value
    _index += 1

    lat = float(row[0])
    lon = float(row[1])
    depth = float(row[2])
    temp = float(row[3])

    # 🌊 Derived Ocean Parameters
    pressure = depth * 0.01 + 1
    salinity = 34.5 + depth * 0.0005
    density = 1025 + depth * 0.002
    current = 0.5 + (depth % 50) * 0.01

    return {
        "lat": lat,
        "lon": lon,
        "depth": depth,
        "temp": temp,
        "pressure": pressure,
        "salinity": salinity,
        "density": density,
        "current": current
    }