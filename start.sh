#!/bin/bash

echo "🚀 Starting Porada Legal AI..."

if [ ! -f "./apps/ml-service/outputs/config.json" ]; then
    echo "❌ Error: Model config.json not found at ./apps/ml-service/outputs/"
    echo "Please train the model first or check the path"
    exit 1
fi

echo "📁 Setting up model files..."
mkdir -p ./apps/backend/models
cp ./apps/ml-service/outputs/config.json ./apps/backend/models/
cp ./apps/ml-service/outputs/model.safetensors ./apps/backend/models/
cp ./apps/ml-service/outputs/task_heads.pt ./apps/backend/models/

echo "✅ Model files copied successfully"

echo "🐳 Starting Docker services..."
docker-compose up --build

echo "🎉 Porada Legal AI is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
