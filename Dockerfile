# Node 24 until phase 2: jsonwebtoken@8 relies on SlowBuffer, removed in Node 25+
# pnpm is installed explicitly because corepack is no longer bundled from Node 25
FROM node:24-alpine AS base
RUN npm install -g pnpm@12.15.0
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Development: all dependencies; src/ is mounted by docker compose
FROM base AS dev
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# Production: runtime dependencies only
FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod

FROM node:24-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
RUN chown node:node /app
USER node
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
EXPOSE 3000
CMD ["node", "src/index.js"]
