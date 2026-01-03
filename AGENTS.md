# Soap-Selling Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-03

## Active Technologies

- TypeScript 5.8.2 + React 19.2.3 + Vite 6.2.0 (main)
- TypeScript 5.8.2 + React 19.2.3 + Vite 6.2.0 (1-webhook-order-submission)
- TypeScript 5.8.2 + React 19.2.3 + Vite 6.2.0 (2-multi-item-order)

## Project Structure

```text
src/
├── types/
├── services/
├── hooks/
└── components/

tests/
```

## Commands

bun install; bun run dev

## Code Style

TypeScript 5.8.2: Follow standard conventions

## Recent Changes

- main: Added TypeScript 5.8.2 + React 19.2.3 + Vite 6.2.0
- 1-webhook-order-submission: Added Pabbly webhook integration with retry logic, environment variable configuration, and JSON payload structure
- 2-multi-item-order: Added cart functionality with localStorage persistence, multi-item checkout, and single customer object in webhook payload
