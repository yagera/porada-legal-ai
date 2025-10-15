#!/bin/bash

echo "Setting up trained model for backend..."

MODEL_SOURCE="./apps/ml-service/outputs"
MODEL_DEST="./apps/backend/models"

if [ ! -f "$MODEL_SOURCE/config.json" ]; then
    echo "Error: Model config.json not found at $MODEL_SOURCE"
    echo "Please train the model first or check the path"
    exit 1
fi

mkdir -p "$MODEL_DEST"

echo "Copying model files..."
cp "$MODEL_SOURCE/config.json" "$MODEL_DEST/"
cp "$MODEL_SOURCE/model.safetensors" "$MODEL_DEST/"
cp "$MODEL_SOURCE/task_heads.pt" "$MODEL_DEST/"

if [ -f "$MODEL_DEST/config.json" ] && [ -f "$MODEL_DEST/model.safetensors" ] && [ -f "$MODEL_DEST/task_heads.pt" ]; then
    echo "✅ Model files copied successfully!"
    echo "Files copied:"
    ls -la "$MODEL_DEST"
else
    echo "❌ Error: Some model files are missing"
    exit 1
fi

echo "Model setup complete!"
