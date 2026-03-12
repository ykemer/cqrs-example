# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Scripts

- **Build**: `npm run build` – compiles TypeScript to JavaScript (`tsc`).
- **Dev**: `npm run dev` – runs the application with file watching (`nodemon` + `ts-node`).
- **Run**: `npm run run` – executes the main entry point (`src/index.ts`).
- **Lint**: `npm run lint` – runs ESLint on source files.
- **Lint:Fix**: `npm run lint:fix` – automatically fixes linting issues.
- **Format**: `npm run format` – runs Prettier to format files.
- **Format:Check**: `npm run format:check` – checks formatting without modifying files.
- **Test**: `npm run test` – runs Jest tests in test environment.
- **Test:Watch**: `npm run test:watch` – runs Jest in watch mode.
- **Test:Cov**: `npm run test:cov` – runs tests with coverage reporting.
- **Migrate**: `npm run migrate` – executes database migrations via Sequelize CLI.
- **Seed-Db**: `npm run seed-db` – seeds the database with initial data.

## Commonly Used Tools

- **Prettier** – code formatting (`format`, `format:check`).
- **Knip** – identifies unused code (`knip`).
- **ESLint** – linting (`lint`, `lint:fix`).

## Project Architecture Overview

The codebase follows a CQRS (Command Query Responsibility Segregation) pattern organized under `src/`:

- **shared/** – Common utilities, middleware, domain errors, DTOs, services, and DI containers used across slices.
- **slices/** – Domain-specific modules (e.g., `auth`, `users`, `courses`, `classes`, `enrollments`). Each slice contains routers, controllers, use‑cases, and sometimes its own index file.
- **index.ts** – Main entry point that sets up the Express server and mounts routers.
- **services/** – High‑level services such as authentication, persistence, and logging.
- **middleware/** – Express middleware for validation, authentication, error handling, and logging.
- **domain/** – Core domain models, DTOs, and error definitions.
- **persistence/** – Database setup and repository patterns, typically using Sequelize.

The project uses TypeScript with `tsconfig-paths` for path aliases, `reflect-metadata` for decorators, and Sequelize as the ORM. Database interactions are abstracted through services and repositories.

## Testing

Tests are written with Jest and can be run via the `test`, `test:watch`, and `test:cov` scripts. Tests are colocated with code (often in `__tests__` folders or next to implementation files).

## Environment Variables

The application relies on environment variables typically loaded via a `.env` file (handled by the `dotenv` package). Common variables include database connection strings, JWT secrets, and rate‑limit configurations.

## Database

Sequelize is used as the ORM. Migration and seeding commands are available via `npm run migrate` and `npm run seed-db`, which invoke `sequelize-cli`.

## Useful Development Commands

- `npm run knip` – runs the Knip unused‑code analyzer.
- `npm run format` – formats all `src/**/*.{ts,tsx,json,md}` files.
- `npm run format:check` – validates formatting.

## Notes for Future Contributors

- Follow the existing folder structure and naming conventions.
- Keep domain logic within the appropriate slice; avoid cross‑slice dependencies.
- When adding new features, ensure corresponding tests are added.
- Keep migration scripts up‑to‑date with schema changes.