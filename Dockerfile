# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.12.1

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

USER node

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/app.js"]

LABEL org.opencontainers.image.source=https://github.com/feiltom/brevo-exporter
LABEL org.opencontainers.image.description="Simple exporter to expose metrics from the Brevo (formerly Sendinblue) API"
LABEL org.opencontainers.image.licenses=GPL-3.0-or-later