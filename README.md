# CQRS test project

This repo contains a small CQRS learning project. Added here:

- docker-compose.yml: creates two PostgreSQL nodes (master on host port 5551, replica on host port 5552). Services use Bitnami PostgreSQL image with replication configured.

- Sequelize-based persistence under `src/infrastructure/persistence`:
  - `config/database.ts` - helper to create Sequelize instance from env or defaults
  - `models/` - Sequelize model definitions converted from the provided Prisma schema
  - `index.ts` - model initialization and association wiring
  - `sync.ts` - small script to sync models to DB (used for testing)

Quick start

1. Start DB cluster (docker-compose):

```bash
docker-compose up --build -d
```

Master will be available on localhost:5551, replica on localhost:5552.

2. Sync DB schema (wait for DB to be healthy):

```bash
npm install
npm run db:sync
```

This runs `src/infrastructure/persistence/sync.ts` which authenticates and runs `sequelize.sync({ force: true })` (dev-only convenience).

Important note about replication and authentication

- For local development we append a permissive `pg_hba.conf` entry to allow the `replicator` role to connect from the replica container. This is done in `docker/master/init-replication.sh` and is intentionally wide (0.0.0.0/0 md5) for simplicity in ephemeral local environments — do NOT use this setting in production. In production, restrict the IP range and use secure credentials and TLS.

Notes

- The Docker Compose setup doesn't persist volumes by design (per your request). Data will be lost when containers stop.
- If `npm run db:sync` fails with connection refused, ensure docker-compose is up and healthy and allow a few seconds for DB to start.
- For production, use migrations instead of `sequelize.sync`.
