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

### Schema & Route Type Management
- **Schema Naming:** Export JSON schemas in UPPERCASE constants (e.g., `DELETE_CLASS_PARAMS_SCHEMA`, not `deleteClassParamsSchema`).
- **Route Type Safety:** Always define separate type interfaces for route parameters to avoid Express typing conflicts with `any`:
  ```typescript
  type DeleteClassParams = { courseId: string; classId: string };
  router.delete('/api/v1/courses/:courseId/classes/:classId',
    validate<DeleteClassParams>({params: DELETE_CLASS_PARAMS_SCHEMA}),
    async (req: Request<DeleteClassParams>, res: Response) => { ... }
  );
  ```
- **Separate Query Parameter Types:** Never reuse CQRS Query class names for Express query parameter types. Use distinct names to avoid conflicts:
  ```typescript
  type ListClassesQueryParams = { page: number; pageSize: number }; // For Express
  export class ListClassesQuery extends RequestData<ListClassesResponse> { } // CQRS Query
  ```

### Query Parameter Handling & Type Coercion
- **Explicit Number Casting:** Express delivers query/path parameters as strings. Always explicitly cast pagination and numeric values in command/query constructors:
  ```typescript
  constructor(page: number = 1, pageSize: number = 10) {
    this.page = Number(page);      // Convert string to number
    this.pageSize = Number(pageSize);
    this.skip = (Number(page) - 1) * Number(pageSize);
  }
  ```
- **Query Parameter Defaults:** Define optional parameters with defaults in AJV schemas:
  ```typescript
  export const LIST_USERS_QUERY_SCHEMA = {
    type: 'object',
    properties: {
      page: {type: 'integer', minimum: 1, default: 1},
      pageSize: {type: 'integer', minimum: 1, maximum: 10, default: 10},
    },
    required: [], // All optional—defaults apply if missing
  };
  ```

### Validation & Error Handling
- **AJV Setup:** Call `addFormats(ajv)` without arguments to enable all standard format validators (email, uuid, date-time, etc.). Missing format support causes validation errors.
- **Error Message Safety:** Transform AJV validation errors defensively to prevent 503 errors:
  ```typescript
  function getErrorMessage(error: any): string {
    const {keyword, params = {}} = error;
    const messageMap: Record<string, (p: any) => string> = {
      enum: () => `Must be one of: ${Array.isArray(params.allowedValues) 
        ? params.allowedValues.join(', ') : 'unknown'}`,
      // ...handle other keywords safely...
    };
    try { return messageMap[keyword]?.(params) || error.message; }
    catch { return error.message || 'Validation failed'; }
  }
  ```
- **Business Logic Validation:** Cross-field and domain validations belong in handlers, not schemas. Use `BadRequestError` (returns 400):
  ```typescript
  if (command.registrationDeadline >= command.startDate) {
    throw new BadRequestError('Registration deadline must be before start date');
  }
  ```

## Testing Constraints
- **Test-Driven:** Follow strict execution order:
  1. Write tests for all edge cases and error handling (400, 401, 403, 404, 409).
  2. Write tests for happy path scenarios (200, 201, 204).
- **Atomic Tests:** Each `it` block must verify EXACTLY ONE scenario and ONE status code. No multi-assertion blocks.
- **Isolated Setup:** Use `beforeEach` or isolated data creation within `it` blocks. Never share state between tests.
- **Integration Testing:**
  - Env: `NODE_ENV=test`
  - Database: `sqlite::memory:`
  - Setup: Use `tests/utils/db.ts` and `tests/builders/` for record persistence
- **Builders:** Use the Builder Pattern for all Models and DTOs. These must live in `tests/builders/`.
- **Mocking:** 
  - Mock `mediatR.publish` in integration tests if side effects (notifications) are not under test.
  - Do NOT mock database operations in integration tests; use the real in-memory SQLite implementation.
- **Coverage:** Aim for 100% code coverage per slice. Coverage ignores `tests/` directory.

## File Structure
- `src/slices/`: Feature-based vertical slices.
- `src/shared/`: Shared models, errors, middleware, and services.
- `tests/integration/`: Slice-specific integration tests.
- `tests/builders/`: Reusable builder classes for data setup.
- `tests/utils/`: Shared test helpers (app creator, db helpers).

