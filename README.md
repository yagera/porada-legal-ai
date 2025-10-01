# Porada Legal AI

Монорепозиторий для AI-платформы анализа юридических документов.

## Структура проекта

```
porada-legal-ai/
├── apps/
│   ├── frontend/          # React фронтенд
│   ├── backend/           # Backend API
│   └── ml-service/        # ML сервис
├── packages/
│   ├── shared/            # Общие утилиты
│   ├── types/             # TypeScript типы
│   └── ui/                # UI компоненты
└── docs/                  # Документация
```

## Фронтенд (React + TypeScript)

### Технологии
- React 18 + TypeScript
- Vite для сборки
- Tailwind CSS для стилей
- React Router для навигации
- React Query для данных

### Запуск

```bash
cd apps/frontend
npm install
npm run dev
```

Фронтенд будет доступен на http://localhost:5173

### Скрипты
- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для продакшена
- `npm run type-check` - проверка типов
- `npm run lint` - проверка кода

## Статус разработки

- ✅ Структура монорепозитория
- ✅ React фронтенд с базовыми страницами
- ✅ TypeScript конфигурация
- ✅ Tailwind CSS настройка
- 🔄 Backend API (в разработке)
- 🔄 ML сервис (в разработке)

## Разработка

1. Клонируйте репозиторий
2. Установите зависимости в нужной папке
3. Запустите dev сервер
4. Начните разработку!

## Лицензия

MIT License