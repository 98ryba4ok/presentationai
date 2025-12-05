#!/bin/sh
set -e

echo "⚙️ Applying migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Gunicorn with stdout logging..."

python manage.py runserver