import random

def get_ooi_data():
    return {
        "acoustic_power": random.uniform(0.1,1.0),
        "temperature": random.uniform(2,20),
        "current": random.uniform(0,2),
        "pressure": random.uniform(1,5)
    }
