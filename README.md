# API Rest Microlearning of LSEC

The project is a rest API with the objective of teaching Ecuadorian Sign Language.

The proyect is build in Nodejs. The forntend are below:

- Fontend: https://github.com/JonnathanE/microlearning-LSEC
- DEMO: https://learn-lsec.herokuapp.com/

## Tech Stack

**Client:** React, Tailwind

**Server:** Node 24, Express, MongoDB, Docker


## Requirements

- Node.js 24 (Node 26 once the dependency upgrade lands)
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
| `DATABASE` | MongoDB connection string |
| `DATABASE_TEST` | MongoDB connection string used by the tests |
| `JWT_SECRET` | Secret used to sign tokens |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for images and GIFs |
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

## Documentation

To deploy this project run

```bash
  pnpm docs
```
[Documentation](https://linktodocumentation)
  
## Running Tests

To run unit tests, run the following command

```bash
  pnpm test
```

To run e2e tests, run the following command

```bash
  pnpm start:test
```

## API Reference

You can go to the `http_API` folder, where you can find a json document of the API and its routes. Upload the file to Postman to view it.
  