#!/bin/bash

set -e

train() {
    cd "$(dirname "$0")/.." || exit 1
    
    if [ -z "$1" ]; then
        python -m src.train
    else
        python -m src.train data.dataset_name="$1" "${@:2}"
    fi
}

mlflow_ui() {
    mlflow ui
}

inference() {
    if [ -z "$1" ]; then
        echo "Usage: $0 inference <model_path> [text]"
        exit 1
    fi
    
    cd "$(dirname "$0")/.." || exit 1
    
    if [ -z "$2" ]; then
        python scripts/inference.py --model_path "$1"
    else
        python scripts/inference.py --model_path "$1" --text "$2"
    fi
}

clean() {
    rm -rf outputs/ cache/ mlruns/ mlartifacts/ .hydra/
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
}

case "${1:-help}" in
    train)
        train "${@:2}"
        ;;
    mlflow)
        mlflow_ui
        ;;
    inference)
        inference "${@:2}"
        ;;
    clean)
        clean
        ;;
    *)
        echo "Usage: $0 {train|mlflow|inference|clean}"
        exit 1
        ;;
esac
