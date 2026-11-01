# API Rest Microlearning of LSEC

The project is a rest API with the objective of teaching Ecuadorian Sign Language.

The proyect is build in Nodejs. The forntend are below:

- Fontend: https://github.com/JonnathanE/microlearning-LSEC
- DEMO: https://learn-lsec.herokuapp.com/

## Tech Stack

**Client:** React, Tailwind

**Server:** Node 26, Express 5, MongoDB (Mongoose 9), Docker


## Requirements

- Node.js 26 (see `.nvmrc`)
- pnpm 12 (`npm install -g pnpm@12`)
- Docker with Docker Compose

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | API port (default `3000`) |
| `CORS_ORIGINS` | Allowed origins, separated by commas (default `http://localhost:3000`) |
| `LOG_LEVEL` | Log level (default `info`) |
| `DATABASE` | MongoDB connection string |
| `DATABASE_TEST` | MongoDB connection string used by the tests |
| `JWT_SECRET` | Secret used to sign tokens, at least 32 characters (`openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for images and GIFs. Required in production; without them, uploads fail |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial admin user created by `pnpm seed` |

## Run with Docker

Start MongoDB and the API (with hot reload on `src/`):

```bash
docker compose up -d
docker compose exec api pnpm seed   # create roles and the admin user
```

Optional MongoDB web UI on http://localhost:8081:

```bash
docker compose --profile tools up -d
```

## Run Locally

Start only MongoDB in Docker and run the API on the host:

```bash
git clone https://github.com/JonnathanE/api-microlearning-LSEC.git
cd api-microlearning-LSEC
docker compose up -d mongo
pnpm install
pnpm seed
pnpm dev
```

## API Documentation

With the server running, the OpenAPI documentation is available at `/docs`.

Changes that affect the frontend are listed in [CHANGELOG.md](CHANGELOG.md).

## Running Tests

MongoDB must be running (`docker compose up -d mongo`). Cloudinary is mocked, so no credentials are needed.

```bash
pnpm test
```

To run the API for the frontend e2e tests, which use `/api/testing/reset`:

```bash
pnpm start:test
```

## Lint and Format

```bash
pnpm lint     # check with Biome
pnpm format   # apply the fixes
```
