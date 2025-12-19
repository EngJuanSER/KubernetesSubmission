#!/bin/bash
set -e

echo "==================================="
echo "Starting Todo Database Backup"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==================================="

BACKUP_FILENAME="todo-backup-$(date +%Y%m%d-%H%M%S).sql"
BACKUP_PATH="/tmp/${BACKUP_FILENAME}"
GCS_BUCKET="${GCS_BUCKET_NAME}"

PGHOST="${POSTGRES_HOST}"
PGDATABASE="${POSTGRES_DB}"
PGUSER="${POSTGRES_USER}"
PGPASSWORD="${POSTGRES_PASSWORD}"

export PGHOST PGDATABASE PGUSER PGPASSWORD

echo "Database: ${PGDATABASE}"
echo "Host: ${PGHOST}"
echo "Bucket: ${GCS_BUCKET}"
echo ""

echo "Creating backup..."
pg_dump -v > "${BACKUP_PATH}"

if [ $? -eq 0 ]; then
    echo "Backup created successfully"
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    echo "  Size: ${BACKUP_SIZE}"
else
    echo "Backup creation failed"
    exit 1
fi

echo ""
echo "Uploading to Google Cloud Storage..."
gsutil cp "${BACKUP_PATH}" "gs://${GCS_BUCKET}/${BACKUP_FILENAME}"

if [ $? -eq 0 ]; then
    echo "Upload successful"
    echo "  Location: gs://${GCS_BUCKET}/${BACKUP_FILENAME}"
else
    echo "Upload failed"
    exit 1
fi

rm "${BACKUP_PATH}"

echo ""
echo "==================================="
echo "Backup completed successfully!"
echo "==================================="

echo ""
echo "Recent backups:"
gsutil ls -lh "gs://${GCS_BUCKET}/" | tail -n 5
