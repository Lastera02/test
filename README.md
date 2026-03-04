# AutoParts MVP (RU/CIS)

Production-ready MVP интернет-магазина автозапчастей (NestJS + Next.js + PostgreSQL + Prisma).

## Структура

- `apps/api` — NestJS REST API + Swagger + Prisma.
- `apps/web` — Next.js App Router + Tailwind.
- `packages/shared` — общие типы и zod-схемы.

## Возможности MVP

- Каталог: категории/бренды/фильтры/поиск/сортировка.
- Совместимость: бренды авто → модели → годы.
- Корзина: локальное состояние (zustand) + серверные эндпоинты.
- Заказы: оформление, статусы, история.
- Auth: register/login/refresh/logout (JWT + refresh cookie).
- Admin CRUD: товары, категории, бренды, авто, заказы.
- Swagger: `/docs`.

## Запуск локально без Docker

```bash
cp .env.example .env
npm install
npm run prisma:generate -w @autoparts/api
npm run prisma:migrate -w @autoparts/api
npm run prisma:seed -w @autoparts/api
npm run dev
```

- API: `http://localhost:4000`
- WEB: `http://localhost:3000`
- Swagger: `http://localhost:4000/docs`

## Запуск Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

## Тесты

```bash
npm run test -w @autoparts/api
npm run test:e2e -w @autoparts/api
```

## Пример деплоя

1. Поднять managed PostgreSQL.
2. Задать переменные окружения из `.env.example`.
3. Для API: `npm run build -w @autoparts/api && npm run start -w @autoparts/api`.
4. Для WEB: `npm run build -w @autoparts/web && npm run start -w @autoparts/web`.
5. Выполнить миграции `npx prisma migrate deploy`.

## Миграции

В репозитории добавлена стартовая миграция Prisma: `apps/api/prisma/migrations/20260303193000_init`.

## Seed-данные

Создаются:
- категории: двигатель/подвеска/тормоза;
- бренды: LADA/ГАЗ/Hyundai-Kia;
- авто: LADA Vesta, UAZ Patriot;
- товары + совместимость;
- админ: `admin@example.com` / `admin123`.
