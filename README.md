# ⚡ MonÉnergie Planner

### *Architecte de votre réalité — énergie consciente, jours maîtrisés*

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 À propos | О проекте

**MonÉnergie Planner** — это гибрид ежедневника, календаря и энергетического трекера.  
Вы больше не просто планируете задачи — вы управляете своей **живой энергией** в течение дня.

> *"Верной дорогою, Товарищ, Вы и есть архитектор своей реальности!"*

### Почему это важно?
- 🎯 **Осознанность** — вы знаете, чем займётесь завтра и через неделю
- 🔋 **Энергия** — каждая задача имеет "стоимость" в батарейках
- 🤖 **AI-помощь** — раскидывает задачи по времени, учитывая ваш тонус
- 📝 **Рефлексия** — запись успехов и мыслей каждый день

---

## ✨ Fonctionnalités | Возможности

### V1.0 (MVP)
| Функция | Статус | Описание |
|---------|--------|----------|
| 📅 Календарь (день/неделя/месяц) | 🚧 В разработке | Визуальное планирование |
| ✅ Ежедневник задач | 🚧 В разработке | Чек-лист на день |
| 🔋 Батарейка энергии | 🚧 В разработке | Оценка затрат (1-5) |
| 💭 Мысли и успехи | 🚧 В разработке | Дневник рефлексии |
| ⏰ Ручная раскидка по времени | 🚧 В разработке | Drag & drop в сетке |
| 🧠 AI-раскидка | 📅 Планируется | Автоматический тайм-менеджмент |
| 🗓️ "Когда-нибудь" | 📅 Планируется | Бэклог желаний |

### V2.0 (Ближайшее будущее)
- 📊 График энергии за неделю
- ☁️ Синхронизация с Google Drive
- 📱 PWA для телефона
- 🔄 Импорт из Google Keep

---

## 🛠️ Stack technique | Технологии

| Категория | Технология | Версия |
|-----------|-----------|--------|
| Frontend | React | 18.2 |
| Язык | TypeScript | 5.0 |
| Сборка | Vite | 4.4 |
| Стили | Tailwind CSS | 3.3 |
| Календарь | FullCalendar | 6.1 |
| Drag & Drop | dnd-kit | 6.0 |
| Состояние | Zustand | 4.4 |
| База данных | IndexedDB (Dexie) | 3.2 |
| AI | OpenAI API (опционально) | — |

---

## 🚀 Démarrage rapide | Быстрый старт

### Требования
- Node.js 18+
- npm 9+ или yarn 1.22+

### Установка

```bash
# Клонируем репозиторий
git clone https://github.com/DS-975/MonEnergiePlanner.git
cd MonEnergiePlanner

# Устанавливаем зависимости
npm install

# Запускаем дев-сервер
npm run de


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
