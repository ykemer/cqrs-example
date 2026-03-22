# CQRS test project

A small CQRS learning project (Node + TypeScript) with a two-node PostgreSQL cluster (master + replica) wired up via Docker Compose.

This project uses a vertical "slice" architecture (also called "slice architecture" or "vertical-slice"). Application features are organized by domain slice under `src/slices/*` (for example `src/slices/auth`, `src/slices/courses`, `src/slices/classes`, `src/slices/users`). Each slice contains its HTTP routes, request/handler definitions and any slice-specific logic, which keeps features self-contained and easy to reason about.

Key points

- Docker Compose brings up two PostgreSQL containers (master on host port 5551, replica on host port 5552). The compose file uses the official `postgres:17.5` image.
- Persistence is implemented with Sequelize. Database configuration lives under `src/shared/persistence/config.js` and the Sequelize models and database helpers live under `src/shared/persistence` and `src/shared/persistence/database`.
- This repository uses Sequelize CLI migrations/seeders. Use the npm scripts `migrate` and `seed-db` to manage schema and initial data.

Quick start

1. Start the DB cluster (from repository root):

```bash
# from repository root
docker-compose -f docker/docker-compose.yml up --build -d
```

Master will be reachable on localhost:5551 and the replica on localhost:5552.

2. Install dependencies and run migrations + seeders:

```bash
npm install
# run migrations (creates schema/tables)
npm run migrate
# optional: seed initial data
npm run seed-db
```

Notes on schema setup

- This project relies on Sequelize migrations stored in the repository. Run `npm run migrate` to apply migrations and `npm run seed-db` to populate seed data.
- If you previously relied on a `sequelize.sync({ force: true })` workflow, be aware the canonical repo scripts use migrations for reproducible schema changes.

Environment variables

The application reads DB connection settings from environment variables. Example values used by the included Docker Compose are shown below — you can export these in your shell or provide them via a .env when running the app (the compose file already configures the containers themselves):

- DB_HOST=localhost
- DB_PORT=5551
- DB_READ_HOST=localhost
- DB_READ_PORT=5552
- DB_NAME=cqrs
- DB_USER=postgres
- DB_PASS=postgrespwd

To run the server locally against the master DB (example):

```bash
export DB_HOST=localhost DB_PORT=5551 DB_READ_HOST=localhost DB_READ_PORT=5552 DB_NAME=cqrs DB_USER=postgres DB_PASS=postgrespwd
npm run dev
```

Available npm scripts

- npm run dev — development server (nodemon + ts-node)
- npm run run — run the application once using ts-node
- npm run build — compile TypeScript to `dist`
- npm run migrate — run Sequelize migrations (uses `npx sequelize-cli db:migrate`)
- npm run seed-db — run Sequelize seeders (uses `npx sequelize-cli db:seed:all`)
- lint/format scripts for code quality

Docker Compose and replication notes

- The compose file mounts two host directories as bind mounts for Postgres data:
  - db-master-data -> device: `/Users/conectcell/Desktop/volumes/cqrs/postgres/master/data`
  - db-replica-data -> device: `/Users/conectcell/Desktop/volumes/cqrs/postgres/replica/data`
  Because these are bind mounts to host paths, the database files persist on the host even if containers are stopped — they are not ephemeral.

- Replication initialization and permissive auth:
  - `docker/master/init-replication.sh` is executed in the master container at initialization time to set up the `replicator` role and allow replication connections from the replica. For convenience this script appends a permissive `pg_hba.conf` entry (wide CIDR) to allow the replica to connect; this is intended for local development only. Do NOT use this wide setting in production — restrict the IP range and secure credentials.
  - `docker/replica/replica-entrypoint.sh` is used to configure the replica container to follow the master.

Troubleshooting

- If migrations fail because the DB is unreachable:
  - Ensure the Docker containers are running and healthy: `docker-compose -f docker/docker-compose.yml ps` and `docker-compose -f docker/docker-compose.yml logs db-master`.
  - The compose healthcheck waits for `pg_isready -U postgres` — give the DB a few seconds to finish starting up before running migrations.

- If you see permission or replication connection issues, check the contents of `docker/master/init-replication.sh` and the master container logs.

Development and tests

- The TypeScript source lives under `src/`. The app entrypoint is `src/index.ts`.
- Features are organized by vertical slice under `src/slices/*` (for example `src/slices/auth`, `src/slices/courses`, `src/slices/classes`, `src/slices/users`).
- Shared infrastructure (di container, mediatr wiring, persistence, middleware, utilities) live under `src/shared`.
- To start the app in development mode (auto-reload) use `npm run dev`.

## Input Validation & Security

This project implements strict input validation using **AJV** with custom format validators to prevent malicious input and common injection attacks. All user input is validated at the middleware level before reaching handlers.

### Three-Layer Format Validators

The project defines three custom AJV format validators in `src/shared/utils/ajv.ts`:

#### 1. **`safeString`** – Most Restrictive
- **Allows:** `a-z`, `A-Z`, `0-9`, `.`, `,`, `!`
- **Rejects:** HTML, spaces, special characters
- **Use for:** User bios, display names, descriptions with limited punctuation
- **Example:** `"John.Doe,Developer!"`

#### 2. **`alphanumeric`** – Very Strict
- **Allows:** `a-z`, `A-Z`, `0-9` only
- **Rejects:** Everything else including dots and spaces
- **Use for:** Usernames, product codes, identifiers
- **Example:** `"JohnDoe123"`

#### 3. **`noHtmlJs`** – Permissive
- **Rejects only:** `< > { } [ ] \`
- **Prevents:** HTML/template injection, JSON object injection, array notation
- **Allows:** Spaces, quotes, special chars (`;`, `@`, `/`, etc.)
- **Use for:** General text, descriptions, comments
- **Example:** `"Welcome to my profile! I love coding, design, and teaching."`

### Using VALIDATION_HELPERS

Always use the centralized `VALIDATION_HELPERS` object with spread syntax in your schemas:

```typescript
import {VALIDATION_HELPERS} from '@/shared/utils/ajv';

export const CREATE_USER_SCHEMA = {
  type: 'object',
  properties: {
    username: {type: 'string' as const, ...VALIDATION_HELPERS.ALPHANUMERIC_STRING},
    email: {type: 'string' as const, ...VALIDATION_HELPERS.EMAIL_STRING},
    bio: {type: 'string' as const, ...VALIDATION_HELPERS.LONG_TEXT_STRING},
    password: {type: 'string' as const, ...VALIDATION_HELPERS.PASSWORD_STRING},
  },
  required: ['username', 'email', 'password'],
} as const;
```

#### Available Helpers

| Helper | Constraints | Use Case |
|--------|-------------|----------|
| `REGULAR_STRING` | format: `noHtmlJs`, minLength: 3, maxLength: 255 | Regular text fields |
| `PASSWORD_STRING` | minLength: 6, maxLength: 255 (no format) | Passwords |
| `LONG_TEXT_STRING` | format: `noHtmlJs`, minLength: 3, maxLength: 1000 | Descriptions, bios |
| `EMAIL_STRING` | format: `email`, minLength: 3, maxLength: 255 | Email addresses |
| `UUID_STRING` | format: `uuid`, maxLength: 36 | Identifiers |
| `DATETIME_STRING` | format: `date-time`, minLength: 4, maxLength: 50 | ISO 8601 timestamps |
| `SMALL_POSITIVE_NUMBER_HELPER` | minimum: 1, maximum: 1000 | Counts, IDs |
| `PAGE_SIZE_NUMBER_HELPER` | minimum: 1, maximum: 50, default: 10 | Pagination |
| `PAGE_NUMBER_HELPER` | minimum: 1, default: 1, maximum: 10000 | Page numbers |

### Security Guidelines

✅ **Do:**
- Use `VALIDATION_HELPERS` constants for all string fields
- Use `alphanumeric` format for usernames and identifiers
- Use `email` format for email addresses
- Define length constraints for all strings (no unbounded inputs)
- Implement cross-field validation in handlers, not schemas

❌ **Don't:**
- Use `any` type or skip validation
- Use `noHtmlJs` for usernames (use `alphanumeric` instead)
- Store raw strings without format validation
- Allow unbounded string lengths
- Implement business logic validation in schemas (use handlers)

### Attack Prevention

The validators prevent common injection attacks:
- **XSS:** Rejects `< > { } [ ] \`
- **NoSQL Injection:** Rejects `{ }` in strict validators
- **Template Injection:** Rejects `{ } [ ]`
- **HTML Injection:** Rejects `<` and `>`

### Testing Validation

Comprehensive validation tests exist in `tests/unit/shared/utils/ajv.spec.ts`. Run them with:

```bash
npm test -- tests/unit/shared/utils/ajv.spec.ts
```

The test suite covers 108 test cases including:
- Happy path scenarios for all format validators
- Edge cases and attack vectors (XSS, SQL injection, command injection, LDAP injection)
- All 9 `VALIDATION_HELPERS` with length and format constraints
- Real-world validation scenarios

Security reminder

- The sample replication setup intentionally uses permissive settings to make local testing simple. For any non-local environment, lock down `pg_hba.conf`, use secure passwords, and enable TLS.
- All user input is validated at the API boundary using AJV format validators before reaching handlers.
- Never disable validation or use unbounded string lengths in production.
