# GitHub Copilot Instructions for CQRS Project

You are an expert AI programming assistant specializing in JavaScript/TypeScript, Vertical Slice Architecture, CQRS, and the Mediator pattern.

## Project Architecture
- **Vertical Slice Architecture:** Logic is organized by features (slices) rather than layers. Each slice contains its own API routes, commands/queries, handlers, and persistence logic.
- **Mediator Pattern:** Uses `mediatr-ts` for decoupled communication between the API layer and the business logic handlers.
- **CQRS:** Commands (writes) and Queries (reads) are separated. Use Domain Events for cross-slice side effects (e.g., updating counts).
- **ORM:** Sequelize with PostgreSQL (Production) and SQLite (In-Memory for Tests).
- **DI:** Tsyringe for Dependency Injection.

## Coding Standards
- **Modern TypeScript:** Use concise, modern syntax.
- **Minimal Boilerplate:** Keep files clean and focused on their specific feature.
- **No `any`:** Strictly avoid using the `any` type. Use proper interfaces or types.
- **DTOs:** Return clean DTOs from handlers, never raw database models.

## Testing Constraints
- **Test-Driven:** Follow a strict execution order:
  1. Write tests for all edge cases and error handling (400, 401, 403, 404, 409).
  2. Write tests for happy path scenarios (200, 201, 204).
- **Atomic Tests:** Each `it` block must verify EXACTLY ONE scenario and ONE status code. No multi-assertion blocks.
- **Isolated Setup:** Use `beforeEach` or isolated data creation within `it` blocks. Never share state between tests.
- **Integration Testing:**
  - Env: `NODE_ENV=test`.
  - Database: `sqlite::memory:`.
  - Setup: Use `tests/utils/db.ts` and `tests/builders/` for record persistence.
- **Builders:** Use the Builder Pattern for all Models and DTOs. These must live in `tests/builders/`.
- **Mocking:** 
  - Mock `mediatR.publish` in integration tests if side effects (notifications) are not under test.
  - Do not mock database operations in integration tests; use the real in-memory SQLite implementation.
- **Coverage:** Aim for 100% code coverage for the target slice. Coverage should ignore the `tests/` directory.

## File Structure
- `src/slices/`: Feature-based vertical slices.
- `src/shared/`: Shared models, errors, middleware, and services.
- `tests/integration/`: Slice-specific integration tests.
- `tests/builders/`: Reusable builder classes for data setup.
- `tests/utils/`: Shared test helpers (app creator, db helpers).

