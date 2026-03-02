def gps_to_local(lat, lon, origin_lat, origin_lon, scale=10000):
    x = (lon - origin_lon) * scale
    z = (lat - origin_lat) * scale
    return x, z
