#!/bin/sh
set -e

echo "⚙️ Applying migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Gunicorn with stdout logging..."

gunicorn presentations_project.wsgi:application --reload --bind 0.0.0.0:8000 --workers 4
