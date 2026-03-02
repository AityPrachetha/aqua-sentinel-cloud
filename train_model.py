import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("signal_data.csv")

X = df.drop("label", axis=1)
y = df["label"]

Xtrain, Xtest, ytrain, ytest = train_test_split(X, y, test_size=0.2)

model = RandomForestClassifier(n_estimators=150)
model.fit(Xtrain, ytrain)

acc = model.score(Xtest, ytest)
print("Accuracy:", acc)

joblib.dump(model, "model.pkl")
print("Model Saved")
