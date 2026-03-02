import pandas as pd
import os

CSV_PATH = os.path.join(os.path.dirname(__file__), "AIS_2024_01_01.csv")

# simple playback index
idx = 0

def get_ais_targets(limit=5):
    global idx

    df = pd.read_csv(CSV_PATH)

    # required columns
    df = df[["MMSI","LAT","LON","SOG"]].dropna()

    # loop rows like playback
    start = idx
    end = idx + limit

    if end >= len(df):
        idx = 0
        start = 0
        end = limit

    slice = df.iloc[start:end]
    idx += limit

    ships = []

    for _, r in slice.iterrows():
        ships.append({
            "lat": float(r["LAT"]),
            "lon": float(r["LON"]),
            "speed": float(r["SOG"])
        })

    return ships
