import requests

def get_aishub_targets():

    url="https://data.aishub.net/ws.php?username=anonymous&format=1&output=json"

    try:
        r=requests.get(url,timeout=10)
        data=r.json()
    except:
        return []

    ships=[]

    for s in data[:6]:
        ships.append({
            "lat":float(s["LATITUDE"]),
            "lon":float(s["LONGITUDE"]),
            "speed":float(s["SOG"])
        })

    return ships
