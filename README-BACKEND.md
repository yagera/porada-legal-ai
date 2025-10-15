# Porada Legal AI - Backend Integration

## Обзор

Этот проект интегрирует обученную модель машинного обучения в полноценный backend с использованием FastAPI, MinIO для хранения файлов и Docker для простого развертывания.

## Архитектура

- **Backend API**: FastAPI с асинхронной обработкой
- **Хранилище**: MinIO (S3-совместимое)
- **Модель**: Интеграция обученной модели из ML-сервиса
- **Frontend**: React с проксированием API

## Структура файлов модели

Для работы backend нужны следующие файлы из обученной модели:
- `config.json` - конфигурация модели
- `model.safetensors` - веса модели
- `task_heads.pt` - веса головок для задач

## Быстрый запуск

### 1. Подготовка модели

Файлы модели должны находиться в:
```
apps/ml-service/outputs/
├── config.json
├── model.safetensors
└── task_heads.pt
```

Скрипт автоматически скопирует их в backend:
```bash
# Автоматическое копирование при запуске
./start.sh
```

### 2. Запуск всего проекта

```bash
# Запустить все сервисы
docker-compose up --build

# Или в фоновом режиме
docker-compose up -d --build
```

### 3. Проверка работы

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## API Endpoints

### Основные

- `GET /` - Проверка работоспособности
- `GET /health` - Детальная проверка здоровья сервисов

### Анализ документов

- `POST /api/analyze` - Анализ загруженного документа
- `GET /api/analysis/{analysis_id}` - Получить результат анализа
- `GET /api/analyses` - Список всех анализов
- `DELETE /api/analysis/{analysis_id}` - Удалить анализ

### Пример использования

```bash
# Загрузка и анализ документа
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"

# Получение результата
curl "http://localhost:8000/api/analysis/{analysis_id}"
```

## Конфигурация

Настройки находятся в `apps/backend/src/config.py`:

- **Модель**: путь к файлам модели
- **MinIO**: настройки подключения к хранилищу
- **API**: настройки сервера

## Разработка

### Локальная разработка

```bash
# Backend
cd apps/backend
pip install -r requirements.txt
uvicorn src.main:app --reload

# Frontend
cd apps/frontend
npm install
npm run dev
```

### Логи

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f minio
```

## Структура проекта

```
apps/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── main.py         # Основное приложение
│   │   ├── config.py       # Конфигурация
│   │   ├── models/         # Pydantic модели
│   │   └── services/       # Бизнес-логика
│   ├── models/             # Файлы обученной модели
│   └── requirements.txt
├── frontend/               # React frontend
└── ml-service/            # ML обучение (уже готово)

docker-compose.yml          # Оркестрация сервисов
scripts/setup-model.sh      # Скрипт настройки модели
```

## Безопасность

- MinIO настроен с базовой аутентификацией
- CORS настроен для frontend
- Валидация типов файлов
- Ограничение размера файлов

## Мониторинг

- Health checks для всех сервисов
- Логирование через Python logging
- Метрики обработки документов

## Troubleshooting

### Модель не загружается
- Проверьте наличие файлов модели в `apps/ml-service/outputs/`
- Убедитесь, что файлы `config.json`, `model.safetensors`, `task_heads.pt` существуют

### MinIO недоступен
- Проверьте, что порты 9000 и 9001 свободны
- Проверьте логи: `docker-compose logs minio`

### Backend не отвечает
- Проверьте логи: `docker-compose logs backend`
- Убедитесь, что модель загружена: `curl http://localhost:8000/health`
