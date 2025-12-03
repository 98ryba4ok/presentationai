#!/bin/sh
set -e

echo "⚙️ Applying migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Gunicorn with stdout logging..."

exec gunicorn presentations_project.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --access-logfile '-' \
    --error-logfile '-' \
    --capture-output \
    --log-level debug
