#!/bin/sh
set -e

echo "⚙️ Applying migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Gunicorn with stdout logging..."

sleep 2 && python manage.py runserver