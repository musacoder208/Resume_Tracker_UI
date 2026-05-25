# Resume Tracker

A modern resume tracking application built with React + TypeScript + Vite.

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** (build tool)
- **Tailwind CSS 4** (styling via CSS variables + utility classes)
- **Redux Toolkit** + **RTK Query** (state & API management)
- **React Hook Form** + **Zod** (form handling & validation)
- **React Router 7** (routing)
- **i18next** (internationalization + RTL support)
- **TanStack Table** (data grid)
- **Heroicons** (icon library)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── app/          # Bootstrap, routing, guards, layout, middleware, store
├── features/     # Feature modules (one folder per domain)
├── components/   # Shared reusable UI components
├── services/     # API base layer (RTK Query)
├── hooks/        # Shared custom hooks
├── theme/        # Theme system (CSS variables, multi-theme)
├── i18n/         # Internationalization setup
├── styles/       # Global CSS + Tailwind config
├── config/       # Environment configuration
├── constants/    # Shared constants
├── types/        # Shared TypeScript types
├── utils/        # Utility functions
└── icons/        # Centralized icon barrel
```

## Rules

See `rules/rules.md` for coding standards and architectural rules.
