# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Scripts

- `npm run build` – compile TypeScript to `dist/`
- `npm run dev` – run with nodemon + ts-node (file watching)
- `npm run test` – run all Jest tests
- `npm run test:watch` – Jest in watch mode
- `npm run test:cov` – tests with coverage report
- `npm run lint:fix` – auto-fix ESLint issues
- `npm run format` – Prettier formatting
- `npm run knip` – detect unused code
- `npm run migrate` – run Sequelize migrations
- `npm run seed-db` – seed database

**Run a single test file:**
```bash
npx jest tests/slices/courses/create-course.handler.spec.ts
```

**Run tests matching a name pattern:**
```bash
npx jest --testNamePattern="should create"
```

## Architecture

The project uses **Vertical Slice Architecture** with **CQRS** and the **Mediator pattern** (`mediatr-ts`).

```
src/
  slices/       # Feature slices: auth, users, courses, classes, enrollments
  shared/       # Cross-cutting: di, domain, mediatr, middleware, persistence, services, swagger, utils
  index.ts      # Express app setup and router registration
tests/
  slices/       # Integration tests per slice
  builders/     # Builder pattern data factories
  utils/        # Shared test helpers (db.ts, handler.ts)
```

### Slice Structure

Each use-case lives in its own file under `src/slices/<domain>/<use-case>/`. A single file contains both the Command/Query class and its handler:

```typescript
// Command/Query
export class CreateCourseCommand extends RequestData<CourseDto> {
  constructor(public name: string, public description: string) { super(); }
}

// Handler
@injectable()
@requestHandler(CreateCourseCommand)
export class CreateCourseCommandHandler implements IRequestHandler<CreateCourseCommand, CourseDto> {
  async handle(cmd: CreateCourseCommand): Promise<CourseDto> { ... }
}
```

The slice router aggregates use-cases and is registered in `src/index.ts`.

### Key Conventions

- **DTOs only** – handlers return clean DTOs (`src/shared/domain/dto/`), never raw Sequelize models.
- **No `any`** – use proper TypeScript types throughout.
- **Cross-slice side effects** – use Domain Events (`mediatR.publish()`), not direct imports between slices. Events are defined in `src/shared/domain/events/`.
- **Database** – Sequelize with PostgreSQL (production) and SQLite in-memory (tests via `NODE_ENV=test`). Sequelize is configured with read/write replicas.
- **DI** – Tsyringe (`@injectable()`). Services registered in `src/shared/di/container.ts` with tokens from `src/shared/di/tokens.ts`.
- **Path alias** – `@/` maps to `src/` (configured in `tsconfig.json` and `jest.config.js`).
- **Error responses** – custom errors extend `CustomError` with a `statusCode`; the global error handler serializes them to RFC 7807 `application/problem+json`.

## Testing

Tests are **integration tests** using a real in-memory SQLite database — do not mock database operations.

**Execution order within each `describe`:**
1. Edge cases and error handling (400, 401, 403, 404, 409)
2. Happy path (200, 201, 204)

**Rules:**
- Each `it` block tests **exactly one scenario and one status code**.
- Use `beforeEach` or isolated data creation; never share state between tests.
- Use **Builder Pattern** for all test data — builders live in `tests/builders/`.
- Mock `mediatR.publish` for side-effect events not under test; never mock DB operations.
- Use `tests/utils/db.ts` for database helpers and `tests/utils/handler.ts` for `expectErrorThrown`.
- Aim for 100% coverage per slice.
