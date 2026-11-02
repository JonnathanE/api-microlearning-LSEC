# Plan de modernización — API Microlearning LSEC

> Estado inicial congelado en el tag `v-tesis` y la rama `master-legacy` (commit `52d88a6`, v2.2.1, agosto 2022).

## Objetivos

1. Actualizar las dependencias para que funcionen con la versión LTS actual de Node.
2. Reemplazar npm por pnpm.
3. Configurar Docker para el proyecto y levantar MongoDB en un contenedor.
4. Mejorar la lógica de negocio: corregir bugs, cerrar huecos de seguridad y ordenar la arquitectura.
5. Instalar TypeScript y migrar todo el código a este lenguaje.

## Flujo de ramas

El proyecto ya usaba git-flow (`develop`, `release/*`, `hotfix/*`). Hoy `develop` tiene el mismo contenido que `master`, así que se sigue con ese flujo:

- Cada fase sale de `develop` en una rama propia (`feature/pnpm-docker`, `feature/deps-node26`, `feature/business-logic`, `feature/typescript`).
- Al terminar cada fase se hace merge a `develop`, con los tests en verde.
- Al cerrar todo el plan se crea `release/3.0.0`, se hace merge a `master` y se crea el tag `v3.0.0`. Es un cambio *major* porque el contrato de la API va a cambiar.

## Orden de las fases

El orden cambia un poco respecto a la lista de objetivos, porque cada fase necesita a la anterior:

| Fase | Contenido | Por qué en este orden |
|---|---|---|
| 0 | Línea base | Hay que saber qué tests pasan hoy para detectar regresiones. |
| 1 | pnpm + Docker/MongoDB | Los tests necesitan una base de datos. Conviene hacer el cambio de gestor antes de tocar dependencias para no regenerar `package-lock.json`. |
| 2 | Dependencias para Node 26 | La actualización de Mongoose obliga a reescribir casi todos los controladores (ver abajo). |
| 3 | Lógica de negocio | Se hace sobre código ya actualizado, en JavaScript, con los tests como red de seguridad. |
| 4 | TypeScript | Es más fácil tipar código que ya está limpio. Si se migra antes, se tipan bugs. |

---

## Fase 0 — Línea base

- [x] Crear la rama `feature/pnpm-docker` desde `develop`.
- [x] Documentar las variables de entorno en un `.env.example` (`DATABASE`, `DATABASE_TEST`, `JWT_SECRET`, `PORT`, `CLOUDINARY_*`).
- [x] Ejecutar la suite actual (`auth`, `module`, `lesson`, `microlearning`, `card`) contra un MongoDB local y anotar qué pasa y qué falla.

**Resultado (Node 24, Mongo 8 en Docker): 45/73 tests pasan.**
- `auth`, `module` y `lesson`: todos pasan.
- `microlearning` (15 fallos) y `card` (13 fallos): la creación (CP40, CP58) devuelve 400 porque sube a Cloudinary sin credenciales y el resto falla en cascada. Hay que mockear Cloudinary en los tests (fase 3) o configurar credenciales de prueba.

## Fase 1 — pnpm y Docker

### pnpm
- [x] Fijar `"packageManager": "pnpm@12.15.0"` en `package.json`. Corepack ya no viene con Node 25+, así que pnpm se instala con `npm i -g pnpm@12`.
- [x] `pnpm import` (genera `pnpm-lock.yaml` a partir de `package-lock.json`) y luego borrar `package-lock.json`.
- [x] `pnpm-workspace.yaml` con `allowBuilds`: los postinstall de `core-js` y `nodemon` quedan desactivados (solo imprimían mensajes).
- [x] Reemplazar `npm run` por `pnpm` en los scripts y en el README.

### Docker
- [x] `Dockerfile` multi-stage basado en `node:24-alpine` (**pasa a `node:26-alpine` en la fase 2**: con Node 26 la app falla porque `jsonwebtoken@8` usa `SlowBuffer`, eliminado en Node 25): una etapa de dependencias y build, y una etapa final con solo lo necesario, ejecutada con el usuario `node` (no root).
- [x] `.dockerignore` (`node_modules`, `.env`, `coverage`, `doc`, `upload`, `.git`).
- [x] `docker-compose.yml` con estos servicios:
  - `mongo`: imagen `mongo:8`, un volumen con nombre para persistir los datos, un healthcheck y el puerto 27017 expuesto solo en local.
  - `api`: depende de `mongo` (con `condition: service_healthy`), lee `.env` y en desarrollo monta `src/` con hot reload.
  - Opcional: `mongo-express`, para inspeccionar la base desde el navegador.
- [x] Usar dos bases separadas en el mismo contenedor: `lsec` para desarrollo y `lsec_test` para los tests.
- [x] Script `seed` (`src/scripts/seed.js`), que crea los roles y un usuario admin inicial a partir de variables de entorno. Se puede ejecutar varias veces.

> Nota: en WSL hay que activar la integración de Docker Desktop con la distro (Settings → Resources → WSL integration).

## Fase 2 — Dependencias compatibles con Node 26

Objetivo: Node 26 (LTS desde octubre de 2026). Fijar `"engines": { "node": ">=26" }`, crear un `.nvmrc` y cambiar el `Dockerfile` a `node:26-alpine`.

### Dependencias a eliminar (no se usan o son redundantes)
| Paquete | Motivo |
|---|---|
| `body-parser` | Express ya trae `express.json()`. |
| `crypto-js` | No se usa en ninguna parte. |
| `formidable`, `lodash` | Se importan pero nunca se usan. |
| `fs-extra` | Se puede reemplazar por `node:fs/promises`. |
| `uuid` | Solo se usa para generar el salt. Se reemplaza por bcrypt (fase 3) o, si hiciera falta, por `crypto.randomUUID()`. |
| `jsdoc`, `docdash`, `jsdoc-http-plugin` | Pasan a `devDependencies` o se reemplazan por OpenAPI (fase 3). |
| `dotenv` | Opcional: Node 26 trae `--env-file=.env` de forma nativa. |
| `nodemon` | Opcional: se puede usar `node --watch` (o `tsx watch` en la fase 4). |

### Actualizaciones principales
| Paquete | Actual | Destino | Cambios que rompen compatibilidad |
|---|---|---|---|
| `express` | 4.17 | 5.x | `app.del` eliminado, cambios en la sintaxis de rutas con comodines y los errores asíncronos se propagan solos. |
| `mongoose` | 5.13 | última estable (8/9) | **Ya no acepta callbacks** (`save(cb)`, `exec(cb)`, `find(cb)`, `updateOne(..., cb)`). Se eliminó `doc.remove()`. Se eliminaron las opciones `useNewUrlParser`, `useCreateIndex` y `useUnifiedTopology`. `strictQuery` cambió. |
| `jsonwebtoken` | 8 | 9 | Por defecto rechaza claves y algoritmos inseguros. |
| `helmet` | 4 (sin uso) | última | Montarlo de verdad en `app.js`. |
| `express-validator` | 6 (sin uso) | 7 | O reemplazarlo por `zod` (encaja mejor con TypeScript). |
| `cloudinary` | 1.x | 2.x | — |
| `mongoose-paginate-v2` | 1.6 | última | — |
| `jest` / `supertest` | 27 / 6 | últimas | Alternativa: `vitest`, que simplifica la fase 4. |

### Impacto en el código (lo más costoso de esta fase)
Al dejar de aceptar callbacks, Mongoose obliga a reescribir con `async/await` + `try/catch`:
- `auth.controller.js`: `user.save(cb)` en `signup` y `User.findOne(..., cb)` en `sigin`.
- `module.controller.js`: `create`, `getAll`, `remove`, `update` y `byId`.
- `lesson.controller.js`: `getAll`, `remove`, `update` y `byId`.
- `home.controller.js`: `addCompleteLesson` y `lessonById`.
- `user.controller.js`: `getByToken`, `byId` y `user.remove()`.
- `microlearning.controller.js` y `card.controller.js`: `remove()` y `byId`.
- `database.js`: quitar las opciones obsoletas.

Criterio de cierre: la suite de la fase 0 pasa igual o mejor sobre Node 26.

### Resultado
- [x] Rama `feature/deps-node26`.
- [x] Mock de Cloudinary en `test/setup.js`, adelantado de la fase 3 para tener cobertura de `microlearning` y `card` antes de reescribirlos. Línea base real: **73/73** con las dependencias antiguas.
- [x] Eliminados: `body-parser`, `crypto-js`, `formidable`, `lodash`, `fs-extra` (→ `fs.promises.rm`), `uuid` (→ `crypto.randomUUID()`, el formato del hash no cambia), `express-validator` (se decide en la fase 3) y `nodemon` (→ `node --watch`). Se mantiene `dotenv` (actualizado a 18, con `quiet: true`).
- [x] `jsdoc`, `docdash` y `jsdoc-http-plugin` pasan a `devDependencies`. Se ejecuta con `pnpm run docs`, porque `pnpm docs` es un comando propio de pnpm.
- [x] Actualizados: Express 5.3, Mongoose 9.11, jsonwebtoken 9, cloudinary 2, mongoose-paginate-v2 1.9, helmet 8 (montado, con `crossOriginResourcePolicy: cross-origin` para que el frontend pueda cargar las imágenes), cors, morgan, express-fileupload, Jest 30, supertest 7 y cross-env 10.
- [x] Todos los callbacks de Mongoose reescritos con `async/await`. `remove()` → `deleteOne()`. Se mantienen los mismos códigos y mensajes de respuesta.
- [x] `engines: >=26`, `.nvmrc` y `Dockerfile` con `node:26-alpine`.
- [x] **73/73 tests en Node 24 (local) y en Node 26 (contenedor).** La imagen de producción arranca y pesa 281 MB (antes 308 MB).

Hallazgos:
- Jest necesita `NODE_OPTIONS=--experimental-vm-modules`: el driver `mongodb@7` carga `os` con `import()` dinámico. Sin la opción, envía metadatos de cliente vacíos sin avisar y MongoDB rechaza la conexión (`Missing required sub-document 'driver'`). En la fase 4 conviene evaluar `vitest`, que no tiene este problema.
- Express 5 deja `req.body` en `undefined` si ningún parser lo procesa. Se agregó un middleware que lo inicializa en `{}` para mantener el comportamiento de Express 4, hasta que la validación de la fase 3 lo vuelva innecesario.
- `PUT /api/home/complete/lesson/:id` devuelve en `message` el resultado de `updateOne`, que ahora tiene otra forma (`acknowledged`, `modifiedCount`...). El frontend no lo usa.
- Los tests levantan el servidor en el puerto 3000: si el contenedor `api` está corriendo, fallan con `EADDRINUSE`. En la fase 3 conviene separar `app` de `listen` para que los tests no abran un puerto.

## Fase 3 — Mejoras en la lógica de negocio

Decisiones tomadas:
- **Lint y formato:** Biome, en lugar de ESLint + Prettier (una sola herramienta). Solo cubre `src/` y `test/`.
- **Validación:** zod, también para las variables de entorno.
- **Sin migración de datos:** el proyecto no está en producción. No se migran imágenes a Cloudinary ni se rehashean contraseñas; una base de datos local anterior se debe recrear (`docker compose down -v`).
- **Borrado:** si un módulo o una lección tiene contenido, se bloquea con 409.
- **Formato de error:** `{ error, code, details? }`. `error` sigue siendo un texto, así que el frontend actual muestra los mensajes.
- **Contraseñas:** argon2id, con un mínimo de 8 caracteres.
- **Sesión:** solo el header `Authorization: Bearer`. Se eliminan la cookie `t` y `signout`, que el frontend no usa.
- **Rutas sin versionar:** `/api/v1` solo hacía falta para convivir con un frontend en producción.
- **Sin Husky:** el lint y los tests se comprueban en CI.

Los cambios que afectan al frontend están en `CHANGELOG.md`.

### 🔴 Seguridad
- [x] `signup` asigna siempre `student` e ignora `roles`. Nuevo `PUT /api/user/:userId/roles`, solo para admins y nunca sobre uno mismo.
- [x] `PUT /api/user/:userId` exige ser el propio usuario o un admin, y no permite cambiar roles.
- [x] Contraseñas con argon2id, en un hook `pre('save')`.
- [x] La contraseña tiene `select: false` y se excluye en `toJSON`: la API nunca la devuelve.
- [x] `authenticate` carga el usuario con sus roles en `req.user`. Un token de un usuario eliminado responde 401 en lugar de 500.
- [x] `JWT_SECRET` se valida al arrancar (mínimo 32 caracteres), el token solo se acepta como `Bearer <token>` y el algoritmo queda fijado en HS256.
- [x] `helmet`, `cors` con lista blanca (`CORS_ORIGINS`) y rate limiting en `/api/auth/*`.
- [x] `/api/testing/reset` solo existe con `NODE_ENV=test`, y la imagen de producción fija `NODE_ENV=production`.
- [x] Eliminada la cookie `t`.
- [x] Agregado: `signin` responde igual ante un correo desconocido y una contraseña errónea, para no revelar qué correos están registrados.
- [x] Agregado: la validación impide inyectar operadores de MongoDB en las credenciales.
- [x] Agregado: solo se aceptan imágenes, con límite de tamaño, y `express-fileupload` se monta después de la autenticación para que un anónimo no pueda escribir en disco.

### 🟠 Bugs
- [x] Eliminados `dberrorHandler.js` e `images.controller.js` con sus errores de escritura (`outuput`, `chartAt`, `errorors`, `res.starus`). Los reemplaza el middleware central de errores.
- [x] La paginación comprueba `totalDocs`.
- [x] `trin` → `trim` en Card y Microlearning.
- [x] Cambiar la contraseña pasa por el mismo hook que al crearla.
- [x] Los roles se crean después de conectar a MongoDB, y el servidor no acepta peticiones hasta entonces.
- [x] Una petición sin archivos responde 400.
- [x] `sortBy` y `order` tienen lista blanca.

### 🟡 Integridad de datos
- [x] Módulos y lecciones con contenido no se pueden eliminar (409). Eliminar una lección o un microcontenido limpia sus referencias en `Learn`, y eliminar un usuario borra su progreso.
- [x] Eliminar un documento borra sus archivos de Cloudinary, y reemplazar un archivo borra el anterior.
- [x] Agregado: si falla una subida o el guardado, se borran los archivos ya subidos.
- [x] Todas las imágenes están en Cloudinary (`icon_url`, `image_url`, `gif_url`) y se quitaron los campos `Buffer`. `GET /api/lesson/icon/:id` redirige a Cloudinary para que el frontend actual siga funcionando.
- [x] `module` y `lesson` se validan antes de subir archivos o guardar.
- [x] `Card` conserva `correctAnswer` y `wrongAnswer`, que son los que usa el frontend. Se quitó `options`.
- [x] Índices en `Lesson.module`, `Microlearning.lesson`, `Card.lesson` y `Learn.user` (único).

### 🟢 Arquitectura y calidad
- [x] Capas `routes → controllers → services → models`. Se eliminó `controllersFactory`.
- [x] Middleware central de errores con errores tipados.
- [x] Validación con zod en cada endpoint (`src/schemas/`).
- [x] Códigos HTTP: 201 al crear, 204 al borrar, 401, 403, 404, 409, 413 y 502.
- [x] `modulesAssigned` sin N+1, con `distinct`.
- [x] Configuración central validada con zod (`src/config/env.js`).
- [x] Logger estructurado con `pino` y `pino-http`, en lugar de `morgan` y `console.log`. Los tokens se ocultan en los logs.
- [x] Graceful shutdown ante `SIGTERM` y `SIGINT`.
- [x] `GET /health`, usado por el healthcheck de Compose.
- [x] OpenAPI en `/docs`, generado a partir de los esquemas de zod. Se eliminaron JSDoc y la colección de Postman.
- [x] `app` separado de `listen` (`src/app.js` y `src/server.js`): los tests ya no abren un puerto ni chocan con el contenedor `api`.
- [x] Biome (`pnpm lint`, `pnpm format`).
- [x] CI en GitHub Actions: lint y tests con un servicio de MongoDB.

**Resultado: 110/110 tests** (los 73 originales adaptados al nuevo contrato y 37 nuevos de seguridad e integridad).

## Fase 4 — Migración a TypeScript

- [x] `typescript`, `@types/*`, `tsx` para desarrollo y `tsc` para el build.
- [x] `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `"module": "NodeNext"`, `"target": "ES2024"`, `allowJs: false`. `tsconfig.build.json` compila solo `src/` en `dist/`.
- [x] ESM (`import`/`export`, `"type": "module"`).
- [x] Todo `src/` migrado: modelos con interfaces y `Schema<T>`, `Express.Request` extendido con `user` y `validatedQuery` (`src/types/express.d.ts`).
- [x] Tipos de entrada inferidos desde zod (`z.infer`).
- [x] Tests migrados a TypeScript y de Jest a **Vitest**. Ya no hace falta `--experimental-vm-modules`, y `fileParallelism: false` mantiene una sola base compartida.
- [x] `Dockerfile` con etapa de build, y la imagen de producción ejecuta `node dist/server.js`.
- [x] No queda ningún archivo `.js` en `src/` ni en `test/`.
- [x] CI: lint, `pnpm typecheck`, `pnpm build` y tests.

El contrato de la API no cambia en esta fase.

## Estructura propuesta al final

```
src/
  config/        env.ts, database.ts
  models/        User.ts, Module.ts, ...
  services/      auth.service.ts, lesson.service.ts, ...
  controllers/   auth.controller.ts, ...
  routes/        index.ts, auth.routes.ts, ...
  middlewares/   auth.ts, validate.ts, error-handler.ts
  schemas/       (zod) auth.schema.ts, ...
  libs/          cloudinary.ts, logger.ts
  errors/        http-errors.ts
  app.ts
  server.ts
  types/         express.d.ts, http.ts
  docs/          openapi.ts
  scripts/       seed.ts
test/
docs/
Dockerfile
docker-compose.yml
```

## Criterios de terminado

- `docker compose up` levanta la API y MongoDB sin pasos manuales, salvo crear el `.env`.
- `pnpm test` pasa en local y en CI.
- `pnpm build` compila sin errores con `strict: true`.
- No hay vulnerabilidades altas en `pnpm audit`.
- El README está actualizado (requisitos, Docker, scripts, variables de entorno y enlace a `/docs`).
