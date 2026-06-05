# STEM Academia Olympiad Platform

Платформа для управления олимпиадами по робототехнике.
3 языка: Русский, Қазақша, English.

## Стек
- **Frontend**: React 18, React Router, Socket.io-client, Axios
- **Backend**: Node.js, Express, Socket.io
- **База данных**: PostgreSQL
- **Авторизация**: JWT

## Структура проекта
```
stem-academia/
├── backend/
│   ├── index.js
│   ├── middleware/auth.js
│   ├── routes/ (auth, teams, arenas, attempts, results, tournaments, categories)
│   ├── db/schema.sql
│   └── scripts/setup.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── i18n.js          ← все переводы (ru/kz/en)
        ├── api/client.js
        ├── components/ (AuthContext, LangContext)
        └── pages/ (Home, Login, Arena, Results)
```

## Запуск на MacBook (шаг за шагом)

### Шаг 1 — Установи необходимые программы

Открой Терминал (⌘ + пробел → "Терминал") и вставь по очереди:

```bash
# Установи Homebrew (менеджер пакетов для Mac)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установи Node.js
brew install node

# Установи PostgreSQL
brew install postgresql@15
brew services start postgresql@15
```

### Шаг 2 — Создай базу данных

```bash
createdb stem_academia
psql stem_academia -f backend/db/schema.sql
```

### Шаг 3 — Настрой бэкенд

```bash
cd backend
cp .env.example .env
```

Открой файл `.env` в VS Code и замени:
```
DATABASE_URL=postgresql://localhost/stem_academia
JWT_SECRET=придумай_длинный_случайный_ключ_минимум_32_символа
```

```bash
npm install
npm run setup    # создаёт пользователей admin и judge
npm run dev      # запускает сервер на http://localhost:4000
```

### Шаг 4 — Запусти фронтенд

Открой новое окно Терминала:
```bash
cd frontend
echo "REACT_APP_TOURNAMENT_ID=<скопируй id из БД>" > .env
npm install
npm start        # откроется http://localhost:3000
```

Чтобы узнать ID турнира:
```bash
psql stem_academia -c "SELECT id, name_ru FROM tournaments;"
```

## Вход в систему

| Логин  | Пароль   | Роль          |
|--------|----------|---------------|
| admin  | Admin123!| Администратор |
| judge1 | Judge123!| Судья 1       |
| judge2 | Judge123!| Судья 2       |

## Деплой в интернет (бесплатно)

### Railway.app (рекомендуется)
1. Зайди на railway.app → создай аккаунт
2. New Project → Deploy from GitHub (загрузи код на GitHub)
3. Добавь PostgreSQL plugin
4. Добавь переменные окружения (DATABASE_URL, JWT_SECRET, PORT)
5. Задеплой frontend на Vercel.com

### Переменные для деплоя
Backend:
- `DATABASE_URL` — строка подключения к БД (Railway даёт автоматически)
- `JWT_SECRET` — длинный случайный ключ
- `PORT` — 4000

Frontend (Vercel):
- `REACT_APP_TOURNAMENT_ID` — ID турнира из БД
- `REACT_APP_API_URL` — URL бэкенда (https://your-app.railway.app)

## Роли
| Роль        | Доступ                              |
|-------------|-------------------------------------|
| admin       | Всё: команды, судьи, результаты     |
| judge       | Арена: оценивание команд            |
| participant | Только просмотр результатов         |
| viewer      | Только просмотр результатов         |

## API
| Метод | URL                    | Описание          |
|-------|------------------------|-------------------|
| POST  | /api/auth/login        | Вход              |
| POST  | /api/auth/register     | Регистрация       |
| GET   | /api/teams             | Список команд     |
| POST  | /api/teams             | Добавить команду  |
| GET   | /api/results           | Результаты        |
| POST  | /api/attempts          | Отправить оценку  |
| GET   | /api/tournaments       | Турниры           |
| GET   | /api/categories        | Категории         |

## Поддержка
Если что-то не работает — обратись к разработчику.
