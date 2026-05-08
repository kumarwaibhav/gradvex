"""
GradVex — MNIST model trainer (Windows-safe, no tensorflowjs required)

Requirements:
  pip install tensorflow

Run:
  python scripts/train_mnist.py

Output:
  public/model/weights.json  (~1.8MB, contains all layer weights/biases)
  public/model/meta.json     (architecture metadata)
"""

import tensorflow as tf
import numpy as np
import json
import os

print("TensorFlow:", tf.__version__)
print("Loading MNIST...")

(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
x_train = x_train.reshape(-1, 784).astype("float32") / 255.0
x_test  = x_test.reshape(-1, 784).astype("float32") / 255.0

print(f"Train: {x_train.shape}  Test: {x_test.shape}")

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(784,)),
    tf.keras.layers.Dense(128, activation="relu",     name="hidden1"),
    tf.keras.layers.Dense(64,  activation="relu",     name="hidden2"),
    tf.keras.layers.Dense(10,  activation="softmax",  name="output"),
], name="gradvex_mlp")

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)
model.summary()

print("\nTraining (15 epochs)...")
model.fit(
    x_train, y_train,
    epochs=15,
    batch_size=256,
    validation_split=0.1,
    verbose=1,
)

loss, acc = model.evaluate(x_test, y_test, verbose=0)
print(f"\nTest accuracy: {acc*100:.2f}%")

# --- Export weights as JSON (no tensorflowjs needed) ---
out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "model")
os.makedirs(out_dir, exist_ok=True)

def to_list(arr):
    return arr.tolist()

weights_data = {
    "W1": to_list(model.get_layer("hidden1").weights[0].numpy()),   # [784, 128]
    "b1": to_list(model.get_layer("hidden1").weights[1].numpy()),   # [128]
    "W2": to_list(model.get_layer("hidden2").weights[0].numpy()),   # [128, 64]
    "b2": to_list(model.get_layer("hidden2").weights[1].numpy()),   # [64]
    "W3": to_list(model.get_layer("output").weights[0].numpy()),    # [64, 10]
    "b3": to_list(model.get_layer("output").weights[1].numpy()),    # [10]
}

meta = {
    "architecture": "784 -> 128 (ReLU) -> 64 (ReLU) -> 10 (Softmax)",
    "test_accuracy": round(float(acc), 4),
    "total_params": model.count_params(),
    "shapes": {
        "W1": [784, 128], "b1": [128],
        "W2": [128, 64],  "b2": [64],
        "W3": [64, 10],   "b3": [10],
    }
}

weights_path = os.path.join(out_dir, "weights.json")
meta_path    = os.path.join(out_dir, "meta.json")

print(f"\nSaving weights to {weights_path}...")
with open(weights_path, "w") as f:
    json.dump(weights_data, f)

with open(meta_path, "w") as f:
    json.dump(meta, f, indent=2)

size_kb = os.path.getsize(weights_path) / 1024
print(f"Done! weights.json = {size_kb:.0f} KB")
print(f"      meta.json    = {os.path.getsize(meta_path)} bytes")
print(f"\nRun: cd gradvex && npx next dev --port 3001")
