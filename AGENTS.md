# AGENTS.md — API Microlearning LSEC

REST API for a microlearning platform to teach Ecuadorian Sign Language (LSEC). Originally built as a university thesis; now being modernized.

- Frontend (separate repo): https://github.com/JonnathanE/microlearning-LSEC
- Modernization plan: `docs/PLAN-MODERNIZACION.md` — **read it before starting any task** and tick off checkboxes as items are completed.

## Current state (update as phases complete)

- TypeScript (strict, ESM) on Node 26: Express 5, Mongoose 9, zod, argon2, pino, Vitest, Biome.
- Done: phases 0 to 4. 110/110 tests pass. Next: `release/3.0.0`, then the frontend plan.

## Commands

```bash
docker compose up -d mongo   # MongoDB only (localhost:27017)
docker compose up -d         # MongoDB + API with hot reload
pnpm dev                     # tsx watch, NODE_ENV=development
pnpm build                   # tsc: src/ into dist/
pnpm start                   # runs dist/server.js
pnpm typecheck               # tsc on src/ and test/
pnpm test                    # vitest, files run one at a time against DATABASE_TEST (needs Mongo up)
pnpm test:coverage
pnpm seed                    # roles + admin user from ADMIN_* env vars (idempotent)
pnpm lint                    # Biome (src/ and test/)
pnpm format                  # apply Biome fixes
```

Use pnpm only; never npm or yarn (there is no `package-lock.json`). Copy `.env.example` to `.env` to start.

Environment variables: see `.env.example`. Inside docker compose, `DATABASE`/`DATABASE_TEST` are overridden to point at the `mongo` service.

## Structure

```
src/server.ts           connects to the database, starts listening, graceful shutdown
src/app.ts              Express app: middlewares and route mounting (no listen, used by the tests)
src/config/             env.ts (validated with zod; never read process.env elsewhere), database.ts
src/routes/             endpoints: chain of auth, upload and validation middlewares + controller
src/controllers/        HTTP only: read the request, call a service, write the response
src/services/           business logic; they throw errors from src/errors/
src/schemas/            zod schemas of the input (also the source of the OpenAPI docs)
src/models/             Mongoose schemas: User, Role, Module, Lesson, Microlearning, Card, Learn
src/middlewares/        auth, validate, upload, rate-limit, error-handler
src/libs/               cloudinary, logger
src/docs/openapi.ts     OpenAPI document served at /docs; update it when endpoints change
src/scripts/seed.ts     roles + initial admin user
src/types/              express.d.ts (req.user, req.validatedQuery), http.ts
test/                   supertest + vitest; test/setup.ts connects, empties the database and mocks Cloudinary
```

Domain: `Module` → has `Lesson`s → each lesson has `Microlearning`s (learning capsules) and `Card`s (knowledge cards with question/answer). `Learn` stores the lessons completed per user. Roles: `student`, `moderator`, `admin`.

`req.user` is the authenticated user with populated roles. After `validate`, `req.params` and `req.body` hold the parsed values and the query is in `req.validatedQuery` (`req.query` is read-only in Express 5).

## Conventions

- **User-facing messages (API responses) in Spanish**; code comments and identifiers in English, as the existing code does.
- Error responses: `{ error: '<mensaje>', code, details? }`, produced only by the central error handler: throw the errors from `src/errors/http-errors.js`. Do not change the response contract without noting it in `CHANGELOG.md` — the frontend depends on it.
- Validate all input with zod in the route, and put business rules in services, not in controllers.
- ESM with `NodeNext`: relative imports end in `.js`, even though the files are `.ts`. Use `import type` for types.
- Infer input types from the zod schemas (`z.infer`). Controllers type their params with `IdParams` and use `currentUser(req)` and `uploadedFile(req, field)` instead of reading `req.user` or `req.files`.
- Match the style of the surrounding file (4-space indentation, single quotes).

## Git

- git-flow: work in `feature/*` branches cut from `develop`; merge to `master` only through `release/*` or `hotfix/*`.
- **Never touch `master-legacy` or the `v-tesis` tag**: they preserve the original thesis version.
- Do not commit `.env`, `upload/`, `doc/` or `coverage/`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<optional scope>): <description>`, e.g. `feat(auth): hash passwords with bcrypt`, `fix(images): correct res.status typo`, `chore(deps): upgrade mongoose`. Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`, `revert`. Breaking changes use `!` (`feat(api)!: ...`) or a `BREAKING CHANGE:` footer.
- **Do not add co-authors** or attribution lines (`Co-Authored-By`, "Generated with...") to commits or PRs.

## Known pitfalls

- Tests within a file depend on their execution order; each file starts with an empty database. Admins are created with `createAdmin()` from `test/helpers.ts`, since the public signup only creates students.
- The `/api/testing/reset` route only exists with `NODE_ENV=test`.
- MongoDB refuses to start on Linux 6.19+ unless `GLIBC_TUNABLES=glibc.pthread.rseq=1` is set (SERVER-121912). It is set in `docker-compose.yml` and in the CI workflow; it can be removed once the image includes a fix.
- `pnpm-workspace.yaml` must list every package with build scripts under `allowBuilds`, or pnpm 12 fails. `argon2` and `esbuild` ship prebuilt binaries, so their scripts stay disabled.
- Databases created before phase 3 have users with the old password format, and they cannot sign in. Recreate them with `docker compose down -v`.
