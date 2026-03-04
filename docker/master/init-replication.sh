#!/bin/bash
set -e

# This script runs only at initial DB bootstrap (first start) via docker-entrypoint-initdb.d.
# It creates the replication role and configures master-side WAL settings.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- Create pgcrypto extension for gen_random_uuid()
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- Create replication role
  CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replicatorpwd';

  -- WAL settings required for streaming replication (PostgreSQL 12+)
  ALTER SYSTEM SET wal_level = 'replica';
  ALTER SYSTEM SET max_wal_senders = 10;
  ALTER SYSTEM SET max_replication_slots = 10;
  ALTER SYSTEM SET wal_keep_size = 64;   -- keep at least 64 MB of WAL segments

  -- Allow replicas to serve read queries (hot standby)
  ALTER SYSTEM SET hot_standby = 'on';

  SELECT pg_reload_conf();
EOSQL

# Allow replication connections from any host inside the Docker network (dev only)
PGDATA_DIR="${PGDATA:-/var/lib/postgresql/data}"
PG_HBA="$PGDATA_DIR/pg_hba.conf"
if [ -w "$PG_HBA" ]; then
  echo "# Allow replication connections for 'replicator' user (added by init-replication.sh)" >> "$PG_HBA"
  echo "host  replication  replicator  0.0.0.0/0  md5" >> "$PG_HBA"
  echo "Updated $PG_HBA"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "SELECT pg_reload_conf();"
else
  echo "WARNING: cannot write $PG_HBA (not found or not writable)"
fi

echo "Master initialized successfully."
