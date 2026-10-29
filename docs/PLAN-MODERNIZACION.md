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

## Fase 3 — Mejoras en la lógica de negocio

### 🔴 Seguridad (prioridad alta)
- [ ] **Escalada de privilegios en el registro:** `POST /api/auth/signup` acepta `roles` en el body, así que cualquiera puede registrarse como `admin`. El registro público debe asignar siempre `student`. La asignación de roles debe hacerse en un endpoint de administración.
- [ ] **Edición de usuarios sin control de propiedad:** `PUT /api/user/:userId` solo exige un token válido, así que cualquier usuario puede modificar a otro. Hay que exigir que sea el propio usuario o un admin, y que nadie pueda cambiarse los roles a sí mismo.
- [ ] **Hash de contraseñas:** hoy se usa HMAC-SHA1 con un salt `uuid v1`. Hay que migrar a `bcrypt` o `argon2`. Para los usuarios existentes, se re-hashea la contraseña al iniciar sesión si el hash es antiguo, o se fuerza un reseteo.
- [ ] `GET /api/user` devuelve `hashed_password` y `salt`. Hay que excluirlos en el schema (`select: false`) o con `toJSON`.
- [ ] `isAdmin` e `isModerator` fallan con un error 500 si el usuario no existe. Además consultan la base dos veces por request. Mejor cargar el usuario con sus roles en `verifyToken` y guardarlo en `req.user`.
- [ ] Validar que `JWT_SECRET` exista al arrancar. Tomar el token solo con el formato `Bearer <token>`.
- [ ] Montar `helmet`, configurar `cors` con una lista blanca de orígenes y poner rate limiting en `/api/auth/*`.
- [ ] La ruta `/api/testing/reset` debe existir solo cuando `NODE_ENV === 'test'`. Hoy es así, pero hay que asegurarlo también en la imagen de Docker.
- [ ] Hay una cookie `t` con `expire: new Date() + 9999` (concatena texto, no es una fecha) y no hay `cookie-parser`. Hay que decidir entre cookie `httpOnly` o solo el header `Authorization`, y quitar lo que no se use.

### 🟠 Bugs
- [ ] `helpers/dberrorHandler.js` tiene errores de escritura que lo rompen: `outuput`, `fieldName` vs `filedName`, `chartAt` y `errorors`. Además empieza con `message = "'"`. Hay que reescribirlo.
- [ ] Existe `res.starus(...)` en `images.controller.js` (3 veces), que lanza un TypeError.
- [ ] En `home.controller.js` se usa `microlearnings.length === 0` sobre el resultado de `paginate`, que es un objeto y no un array. Hay que usar `docs.length` o `totalDocs`.
- [ ] Los esquemas usan `trin: true` en vez de `trim: true` (Card y Microlearning).
- [ ] `user.update` cambia la contraseña sin volver a generar el salt. Hay que usar el virtual o el nuevo hook de bcrypt.
- [ ] `createRoles()` se ejecuta antes de que exista la conexión a MongoDB. Hay que moverlo después de `mongoose.connect` o al script `seed`.
- [ ] Si `req.files` es `undefined` (request sin archivos), se lanza un error en `lesson.create` y en las actualizaciones de imágenes.
- [ ] En `lesson.getAll`, `sortBy` y `order` llegan del query sin validar. Hay que limitarlos a una lista blanca.

### 🟡 Integridad de datos
- [ ] Al eliminar un módulo o una lección quedan huérfanos sus lecciones, microlearnings, cards y referencias en `Learn`. Hay que decidir entre borrado en cascada, borrado lógico o bloquear el borrado si hay hijos.
- [ ] Al eliminar un microlearning o una card no se borran sus archivos de Cloudinary.
- [ ] Unificar el almacenamiento de imágenes: hoy conviven `Buffer` en Mongo (`icon`, `image`, `gif`) y Cloudinary (`*_url`). Pasar todo a Cloudinary con un script de migración y quitar los campos `Buffer`.
- [ ] Validar que `module` y `lesson` referencien documentos que existen antes de guardar.
- [ ] Revisar el modelo `Card`: `correctAnswer` y `wrongAnswer` conviven con `options[]`. Dejar un solo formato.
- [ ] Crear índices para `Lesson.module`, `Microlearning.lesson`, `Card.lesson` y `Learn.user` (único).

### 🟢 Arquitectura y calidad
- [ ] Separar en capas: `routes → controllers (HTTP) → services (negocio) → models`. El `controllersFactory` no aporta nada y se elimina.
- [ ] Usar un middleware central de errores, con errores tipados (`NotFoundError`, `ValidationError`…) y un formato de respuesta uniforme `{ error: { code, message } }`. Express 5 ya propaga los errores async.
- [ ] Validar las entradas con `zod` o `express-validator` en cada endpoint.
- [ ] Usar códigos HTTP correctos: 201 al crear, 404 cuando no se encuentra algo (hoy se usa 400), 409 para duplicados y 204 al borrar.
- [ ] `modulesAssigned` hace una consulta por cada módulo (N+1). Hay que reemplazarlo por un `aggregate` o un `distinct`.
- [ ] Usar un config central validado con `zod` para las variables de entorno.
- [ ] Usar un logger estructurado (`pino`) en vez de `console.log` y `morgan`.
- [ ] Hacer graceful shutdown: cerrar el servidor y la conexión de Mongo ante `SIGTERM`, que es necesario en Docker.
- [ ] Agregar un endpoint `GET /health`, para el healthcheck del contenedor.
- [ ] Documentar la API con OpenAPI/Swagger (`/docs`) en lugar de JSDoc + Postman.
- [ ] Versionar las rutas (`/api/v1/...`) si el frontend tiene que convivir con los cambios.
- [ ] Usar ESLint + Prettier, y opcionalmente Husky + lint-staged.
- [ ] Configurar CI en GitHub Actions: lint + tests con un servicio de MongoDB.

> ⚠️ Varios de estos cambios (códigos HTTP, formato de errores, roles en el registro, imágenes) **afectan al frontend** `microlearning-LSEC`. Hay que anotarlos en un `CHANGELOG.md` para tenerlos en cuenta en su plan.

## Fase 4 — Migración a TypeScript

- [ ] Instalar `typescript`, `@types/node` y `@types/express`. Usar `tsx` para desarrollo y `tsc` para el build (o `tsup`).
- [ ] `tsconfig.json`: `"strict": true`, `"module": "NodeNext"`, `"target": "ES2024"`, `outDir: dist`.
- [ ] Pasar a ESM (`import`/`export`, `"type": "module"`).
- [ ] Migrar de abajo hacia arriba: `config` → `models` (interfaces + `Schema<T>`) → `services` → `middlewares` (extender `Express.Request` con `user`) → `controllers` → `routes` → `app`/`index`.
- [ ] Inferir los tipos de los DTO desde los esquemas de `zod` (`z.infer`).
- [ ] Migrar los tests a TypeScript (`vitest`, o `jest` con `ts-jest`).
- [ ] Ajustar el `Dockerfile`: compilar en la etapa de build y ejecutar `node dist/index.js`.
- [ ] Al terminar, `allowJs: false`: no debe quedar ningún archivo `.js` en `src/`.

## Estructura propuesta al final

```
src/
  config/        env.ts, database.ts
  models/        user.model.ts, module.model.ts, ...
  services/      auth.service.ts, lesson.service.ts, ...
  controllers/   auth.controller.ts, ...
  routes/        index.ts, auth.routes.ts, ...
  middlewares/   auth.ts, validate.ts, error-handler.ts
  schemas/       (zod) auth.schema.ts, ...
  libs/          cloudinary.ts, logger.ts
  errors/        http-errors.ts
  app.ts
  server.ts
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
