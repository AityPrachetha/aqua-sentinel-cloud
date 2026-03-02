from utils.camera import capture_image
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import random
import os
from utils.geo import gps_to_local
from data_sources.argo import get_argo_float

app = Flask(__name__, static_folder="frontend", static_url_path="")
CORS(app)

# ================= DATA =================

trajectory = pd.read_csv("trajectory.csv")
CSV_PATH = "data_sources/ais_small.csv"

ORIGIN_LAT = 35.0
ORIGIN_LON = -80.0

df = pd.read_csv(CSV_PATH)

previous_positions = {}
# ================= FRONTEND =================
@app.route("/")
def index():
    return send_from_directory("frontend", "index.html")
@app.route("/ocean")
def ocean():
    return send_from_directory("frontend", "ocean.html")
@app.route("/captures/<path:filename>")
def serve_capture(filename):
    return send_from_directory("captures", filename)
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("frontend", path)
# ================= PREDICTION =================
@app.route("/predict")
def predict():
    subs = []
    argo = get_argo_float()
    argo_depth = argo["depth"]
    argo_temp = argo["temp"]
    for idx, row in df.sample(5).iterrows():
        lat = float(row["LAT"])
        lon = float(row["LON"])
        sog = float(row["SOG"])
        x, z = gps_to_local(lat, lon, ORIGIN_LAT, ORIGIN_LON, scale=300)
        speed = max(sog, 1)
        x += random.uniform(-1, 1) * speed * 2
        z += random.uniform(-1, 1) * speed * 2
        prev = previous_positions.get(idx)
        movement = 0
        if prev:
            movement = ((x-prev[0])**2 + (z-prev[1])**2)**0.5
        previous_positions[idx] = (x, z)
        alert = False
        image_path = None
        if movement > 30:
            alert = True
            image_file = capture_image(idx)
            if image_file:
                image_path = "/" + image_file
        status = "THREAT" if sog > 5 else "FRIENDLY"
        subs.append({
            "id": int(idx),
            "status": status,
            "x": x,
            "y": -argo_depth/5,
            "z": z,
            "temp": argo_temp,
            "movement": round(movement,2),
            "alert": alert,
            "image": image_path
        })
    return jsonify(subs)
# ================= ARGO =================
@app.route("/argo")
def argo_live():
    return jsonify(get_argo_float())
# ================= CAPTURE LIST =================
@app.route("/captured_images")
def get_captured_images():
    os.makedirs("captures", exist_ok=True)
    images = [
        {"image": f"/captures/{f}"}
        for f in os.listdir("captures")
        if f.endswith(".jpg")
    ]
    return jsonify(images)
# ================= RUN =================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port)