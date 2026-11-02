# pnpm is installed explicitly because corepack is no longer bundled from Node 25
FROM node:26-alpine AS base
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

# Compiles TypeScript into dist/
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY --chown=node:node tsconfig.json tsconfig.build.json ./
COPY --chown=node:node src ./src
RUN pnpm build

# Production: runtime dependencies only
FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod

FROM node:26-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
RUN chown node:node /app
USER node
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
