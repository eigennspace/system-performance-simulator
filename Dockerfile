# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY app/shared-types/package.json app/shared-types/package.json
COPY app/simulation-engine/package.json app/simulation-engine/package.json
COPY app/backend/package.json app/backend/package.json
COPY app/frontend/package.json app/frontend/package.json

RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4300
ENV FRONTEND_DIST=/app/app/frontend/dist

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/app ./app
COPY --from=build /app/package.json ./package.json

RUN mkdir -p /app/app/backend/data && chown -R node:node /app

USER node
EXPOSE 4300

CMD ["node", "app/backend/dist/server.js"]
