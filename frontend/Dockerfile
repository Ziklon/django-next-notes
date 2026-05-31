# syntax=docker/dockerfile:1
FROM node:22-slim

WORKDIR /app

# Enable the exact pnpm version pinned in package.json's "packageManager".
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]
