# AGENTS.md — API Microlearning LSEC

REST API for a microlearning platform to teach Ecuadorian Sign Language (LSEC). Originally built as a university thesis; now being modernized.

- Frontend (separate repo): https://github.com/JonnathanE/microlearning-LSEC
- Modernization plan: `docs/PLAN-MODERNIZACION.md` — **read it before starting any task** and tick off checkboxes as items are completed.

## Current state (update as phases complete)

- Plain JavaScript (CommonJS), Express 4, Mongoose 5, Jest 27, npm.
- Target: Node 26 LTS, pnpm, Docker + MongoDB, Express 5, latest Mongoose, TypeScript (strict, ESM).
- Phase order: 0 baseline → 1 pnpm + Docker → 2 dependencies → 3 business logic → 4 TypeScript. Do not jump ahead (e.g. no TypeScript during phase 2).

## Commands

```bash
npm run dev            # nodemon, NODE_ENV=development
npm start              # production
npm test               # jest, runs in band against DATABASE_TEST
npm run test:coverage
npm run docs           # JSDoc into ./doc
```

Once phase 1 lands, use `pnpm` instead of `npm` and `docker compose up` to start MongoDB.

Required environment variables (`.env`): `DATABASE`, `DATABASE_TEST`, `JWT_SECRET`, `PORT`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Structure

```
src/index.js            starts the server and loads database.js
src/server/app.js       Express app: middlewares and route mounting
src/database.js         Mongoose connection (DATABASE or DATABASE_TEST based on NODE_ENV)
src/routes/*.routes.js  routes + JSDoc documentation (jsdoc-http-plugin)
src/controllers/        classes per resource, instantiated through controllersFactory
src/middlewares/        authJwt (verifyToken, isAdmin, isModerator), verifySignup
src/models/             Mongoose schemas: User, Role, Module, Lesson, Microlearning, Card, Learn
src/libs/               cloudinary, initialSetup (creates roles)
test/                   supertest + jest; test/helpers.js holds fixtures
http_API/               Postman collection
```

Domain: `Module` → has `Lesson`s → each lesson has `Microlearning`s (learning capsules) and `Card`s (knowledge cards with question/answer). `Learn` stores the lessons completed per user. Roles: `student`, `moderator`, `admin`.

Routes use `router.param('<id>', controller.byId)` to load the document into `req.<resource>` before the handler runs.

## Conventions

- **User-facing messages (API responses) in Spanish**; code comments and identifiers in English, as the existing code does.
- Error responses: `{ error: '<mensaje>' }`. Do not change the response contract without noting it in `CHANGELOG.md` — the frontend depends on it.
- Before migrating to TypeScript, write new code with `async/await` + `try/catch`; **never Mongoose callbacks** (removed in Mongoose 7+).
- Match the style of the surrounding file (4-space indentation, single quotes).

## Git

- git-flow: work in `feature/*` branches cut from `develop`; merge to `master` only through `release/*` or `hotfix/*`.
- **Never touch `master-legacy` or the `v-tesis` tag**: they preserve the original thesis version.
- Do not commit `.env`, `upload/`, `doc/` or `coverage/`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<optional scope>): <description>`, e.g. `feat(auth): hash passwords with bcrypt`, `fix(images): correct res.status typo`, `chore(deps): upgrade mongoose`. Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `style`, `revert`. Breaking changes use `!` (`feat(api)!: ...`) or a `BREAKING CHANGE:` footer.
- **Do not add co-authors** or attribution lines (`Co-Authored-By`, "Generated with...") to commits or PRs.

## Known pitfalls

- `POST /api/auth/signup` accepts `roles` in the body (anyone can register as admin). Fix scheduled for phase 3.
- `helpers/dberrorHandler.js` and `res.starus` in `images.controller.js` are broken; do not rely on them.
- Images live in two places: `Buffer` in Mongo (`icon`, `image`, `gif`) and Cloudinary (`*_url`).
- `createRoles()` runs before the DB connection is established.
- Tests share the database and depend on execution order (`--runInBand`); `/api/testing/reset` only exists with `NODE_ENV=test`.
