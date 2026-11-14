FROM php:8.5-cli-alpine

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=node:24-alpine /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-alpine /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

RUN apk add --no-cache bash curl git unzip libstdc++ \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && docker-php-ext-install -j"$(nproc)" pcntl \
    && apk del .build-deps

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts --no-progress

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY . .

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000 5173

ENTRYPOINT ["entrypoint.sh"]
CMD ["php", "artisan", "dev", "--inline"]
