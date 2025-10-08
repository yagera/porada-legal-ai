# Porada Legal AI

AI-powered legal document analysis platform with intelligent chat assistant for contract review and risk assessment.

## 🎯 About

Porada Legal AI helps legal professionals analyze contracts, identify risks, and get instant insights through an intelligent chat interface. Upload your legal documents and ask questions to get comprehensive analysis and recommendations.

## 🚀 Key Features

- **AI Chat Assistant** - Interactive document analysis and Q&A
- **Document Upload** - Support for PDF, DOC, DOCX, TXT files
- **Risk Assessment** - Automated contract risk analysis
- **Real-time Analysis** - Instant insights and recommendations
- **ML Fine-tuning** - Custom model training for Russian legal documents

## 📁 Project Structure

```
porada-legal-ai/
├── apps/
│   ├── frontend/          # React frontend (Vite + TypeScript)
│   ├── backend/           # Backend API (Python/FastAPI)
│   └── ml-service/        # ML training pipeline
│       ├── src/           # Training code (PyTorch + Transformers)
│       ├── configs/       # Hydra configurations
│       └── scripts/       # Inference & utilities
├── packages/
│   ├── shared/            # Shared utilities
│   ├── types/             # TypeScript types
│   └── ui/                # UI components
├── docs/                  # Documentation
└── tools/                 # CI/CD & deployment scripts
```

## 🚀 Getting Started

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### ML Service

```bash
cd apps/ml-service
pip install -r requirements.txt

# Train model
python -m src.train

# Or with custom dataset
python -m src.train data.dataset_name=synthetic

# View metrics
mlflow ui
```

## 🔧 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router

### ML Service
- PyTorch 2.0+
- Hugging Face Transformers
- DeepPavlov RuBERT
- Hydra (config management)
- MLflow (experiment tracking)

### Backend
- Python
- FastAPI (planned)

## 📊 ML Features

- **Multi-task Learning**: NER + Risk Classification
- **Model**: DeepPavlov/rubert-base-cased (110M params)
- **Datasets**: ruleganner, RusLawOD, synthetic
- **Mixed Precision**: bf16 training support
- **Experiment Tracking**: MLflow integration

## 🛠️ Development

```bash
# Install all dependencies
pip install -r requirements.txt

# ML training
cd apps/ml-service
python -m src.train data.dataset_name=ruleganner

# Frontend dev
cd apps/frontend
npm run dev
```

## 📄 License

MIT License
