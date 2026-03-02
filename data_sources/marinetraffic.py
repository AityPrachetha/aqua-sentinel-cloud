import random

def get_marinetraffic():
    ships=[]

    for i in range(6):
        ships.append({
            "id": i,
            "lat": 12.97 + random.uniform(-0.02,0.02),
            "lon": 77.59 + random.uniform(-0.02,0.02),
            "speed": random.uniform(1,15)
        })

    return ships
