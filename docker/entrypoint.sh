#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

mkdir -p \
    bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
fi

if [ "${RUN_MIGRATIONS:-true}" != "false" ]; then
    php artisan migrate --force --no-interaction
fi

exec "$@"
