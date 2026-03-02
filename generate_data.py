import numpy as np
import pandas as pd

def generate():

    samples = 3000

    # Signal Features
    amplitude = np.random.uniform(0.5, 10, samples)
    frequency = np.random.uniform(20, 200, samples)
    doppler = np.random.uniform(-5, 5, samples)
    snr = np.random.uniform(5, 30, samples)
    echo_strength = np.random.uniform(0.1, 1, samples)

    # Threat Logic
    threat = ((frequency > 120) & (snr > 18) & (echo_strength > 0.6)).astype(int)

    df = pd.DataFrame({
        "amplitude": amplitude,
        "frequency": frequency,
        "doppler": doppler,
        "snr": snr,
        "echo": echo_strength,
        "label": threat
    })

    df.to_csv("signal_data.csv", index=False)
    print("Synthetic data generated")

generate()
