# ML Service

Fine-tuning pipeline for Russian legal document analysis.

## Install

```bash
pip install -r requirements.txt
```

## Train

```bash
# Basic
python -m src.train

# With config
python -m src.train --config-name=ner_focused

# With params
python -m src.train data.dataset_name=synthetic training.alpha=0.8

# Using script
./scripts/run.sh train ruleganner
```

## MLflow

```bash
mlflow ui
# or
./scripts/run.sh mlflow
```

## Inference

```bash
python scripts/inference.py --model_path ./outputs --text "Your text"
# or
./scripts/run.sh inference ./outputs "Your text"
```

## Clean

```bash
./scripts/run.sh clean
```
