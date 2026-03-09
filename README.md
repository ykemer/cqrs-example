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

Security reminder

- The sample replication setup intentionally uses permissive settings to make local testing simple. For any non-local environment, lock down `pg_hba.conf`, use secure passwords, and enable TLS.

If you want me to add a small helper script or a `.env.example` file to make local development easier (without changing any application code), tell me and I can propose and add it to the repo.
