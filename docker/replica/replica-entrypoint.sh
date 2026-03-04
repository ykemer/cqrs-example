#!/bin/bash
set -e

# This entrypoint waits for master, does a base backup and starts postgres as a replica.
# Compatible with PostgreSQL 12+ (recovery.conf was removed; use standby.signal instead).
MASTER_HOST=${MASTER_HOST:-db-master}
MASTER_PORT=${MASTER_PORT:-5432}
REPL_USER=${REPLICATOR_USER:-replicator}
REPL_PASS=${REPLICATOR_PASSWORD:-replicatorpwd}
PGDATA=/var/lib/postgresql/data

# Wait for master to be ready
echo "Waiting for master ${MASTER_HOST}:${MASTER_PORT}..."
until pg_isready -h "$MASTER_HOST" -p "$MASTER_PORT" -U postgres >/dev/null 2>&1; do
  sleep 1
done

echo "Master is ready. Setting up replica..."

if [ -d "$PGDATA" ] && [ -f "$PGDATA/PG_VERSION" ]; then
  echo "Data directory already exists — assuming replica is already initialized."
else
  # Ensure data dir is empty and owned by postgres
  rm -rf "${PGDATA:?}"/*  || true
  mkdir -p "$PGDATA"
  chown -R postgres:postgres "$PGDATA"

  # Write .pgpass so pg_basebackup can authenticate without a password prompt
  PGPASSFILE=/tmp/.pgpass
  echo "${MASTER_HOST}:${MASTER_PORT}:*:${REPL_USER}:${REPL_PASS}" > "$PGPASSFILE"
  chmod 600 "$PGPASSFILE"
  chown postgres:postgres "$PGPASSFILE"

  # Perform base backup
  su - postgres -c "PGPASSFILE=${PGPASSFILE} pg_basebackup \
    -h ${MASTER_HOST} \
    -p ${MASTER_PORT} \
    -D ${PGDATA} \
    -U ${REPL_USER} \
    -v -P \
    --wal-method=stream"

  # PostgreSQL 12+: signal file marks this instance as a standby
  touch "${PGDATA}/standby.signal"
  chown postgres:postgres "${PGDATA}/standby.signal"

  # Write replication connection settings into postgresql.auto.conf
  # NOTE: promote_trigger_file was removed in PostgreSQL 12+.
  # To manually promote: docker exec <replica-container> su -c "pg_ctl promote -D $PGDATA" postgres
  cat >> "${PGDATA}/postgresql.auto.conf" <<EOF

# --- Replica settings (added by replica-entrypoint.sh) ---
primary_conninfo = 'host=${MASTER_HOST} port=${MASTER_PORT} user=${REPL_USER} password=${REPL_PASS}'
EOF

  chown postgres:postgres "${PGDATA}/postgresql.auto.conf"
  echo "Replica initialized successfully."
fi

# Hand off to the default postgres entrypoint
exec docker-entrypoint.sh postgres

