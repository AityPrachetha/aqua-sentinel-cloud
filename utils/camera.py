import cv2
import os
import time

cap = cv2.VideoCapture(0)

def capture_image(obj_id):
    ret, frame = cap.read()

    if not ret:
        return None

    os.makedirs("captures", exist_ok=True)

    filename = f"captures/alert_{obj_id}_{int(time.time())}.jpg"
    cv2.imwrite(filename, frame)

    return filename