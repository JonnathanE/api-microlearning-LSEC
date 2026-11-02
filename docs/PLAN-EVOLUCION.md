# Plan de evolución — API Microlearning LSEC

> Segundo proceso de mejora, posterior a la modernización (`v3.0.0`). **Empieza cuando el frontend esté actualizado al contrato 3.0** (ver `docs/PLAN-MODERNIZACION.md` en `microlearning-LSEC`).

Este documento recoge ideas y una propuesta de orden. Las decisiones marcadas como pendientes se confirman antes de implementar cada fase.

## Objetivos

1. Elegir la arquitectura del proyecto: por capas o por módulos.
2. Versionar la API.
3. Implementar refresh token y guardar la sesión en cookies.
4. Mejorar el modelo de datos y la lógica de negocio.
5. Mostrar las respuestas en orden aleatorio y corregirlas en el servidor.
6. Implementar gamificación.

## Orden propuesto

| Fase | Contenido | Por qué en este orden |
|---|---|---|
| 1 | Estructura por módulos | Es casi solo mover archivos, y es más barato antes de agregar dominios nuevos. |
| 2 | `/api/v1`, refresh token y cookies | Cambian el contrato, así que conviene hacerlos juntos y adaptar el frontend una sola vez. |
| 3 | Modelo de datos y corrección en el servidor | Es la base sobre la que se calculan los puntos. |
| 4 | Gamificación | Depende de los intentos registrados en la fase 3. |

Cada fase sigue el flujo del proyecto: rama `feature/*` desde `develop`, tests en verde y cambios de contrato anotados en `CHANGELOG.md`.

---

## Fase 1 — Arquitectura

**Recomendación: módulos por dominio, con capas dentro de cada módulo.**

Hoy cada recurso está repartido en cinco carpetas (`routes`, `controllers`, `services`, `schemas`, `models`), y agregar gamificación empeoraría ese reparto. Las capas siguen siendo válidas: lo que cambia es que se agrupan por dominio. No hace falta una arquitectura hexagonal ni microservicios para un proyecto de este tamaño.

```
src/
  modules/
    auth/           routes, controller, service, schemas
    users/          ... + User.ts, Role.ts
    content/        módulos, lecciones, microcontenidos y tarjetas
    progress/       progreso e intentos
    gamification/   XP, rachas e insignias
  shared/           config, errors, middlewares, libs, types
  app.ts
  server.ts
```

- [ ] Cada módulo expone solo su router y su servicio mediante un `index.ts`.
- [ ] Un módulo no importa los modelos de otro: usa su servicio.
- [ ] `src/docs/openapi.ts` se divide por módulo.
- [ ] Los tests se mantienen en verde sin cambiar el contrato.

**Pendiente de decidir:** si `content` queda como un solo módulo o se separa por recurso. Se recomienda un solo módulo, porque sus reglas de borrado y referencias los unen.

## Fase 2 — Versionado y sesión

### Versionar la API
- [ ] Mover las rutas a `/api/v1`. El frontend solo cambia su variable de entorno.
- [ ] `/health` y `/docs` quedan fuera del prefijo.

### Refresh token y cookies
Hoy el token dura 24 horas, se envía en el header y el frontend lo guarda en `localStorage`, donde queda expuesto si hay un XSS.

- [ ] Access token de vida corta (por ejemplo, 15 minutos).
- [ ] Refresh token en cookie `httpOnly`, `Secure` y `SameSite`, con `path` limitado a la ruta de renovación.
- [ ] Rotación: cada renovación invalida el refresh token anterior. Si se reutiliza uno ya usado, se revoca toda la familia de sesiones.
- [ ] Modelo `RefreshToken` con el hash del token (nunca el valor), usuario, familia y expiración, con índice TTL.
- [ ] Endpoints `POST /auth/refresh` y `POST /auth/signout`, y cierre de todas las sesiones al cambiar la contraseña.
- [ ] CORS con `credentials: true` y protección CSRF.
- [ ] Frontend: interceptor que renueva al recibir 401. El plan de modernización deja este punto centralizado para que el cambio toque un solo lugar.

**Pendiente de decidir:**
- Dónde vive el access token: en memoria del frontend con el refresh en cookie (recomendado), o también en cookie.
- Dominios en producción: si frontend y API comparten dominio, `SameSite=Lax` basta. Si son dominios distintos, hace falta `SameSite=None` y un token CSRF.

## Fase 3 — Modelo de datos y lógica de negocio

### Respuestas aleatorias y corrección en el servidor
Hoy la API envía `correctAnswer` al navegador y la corrección se hace ahí, así que cualquiera puede ver la respuesta en las herramientas de desarrollo. El plan del frontend mezcla las respuestas en el cliente como solución inmediata. Aquí se resuelve de fondo:

- [ ] Una lectura para estudiantes que devuelve las opciones mezcladas, sin indicar cuál es la correcta. Se conserva la vista completa solo para administradores.
- [ ] `POST /cards/:cardId/answer` corrige en el servidor y registra el intento.

### Modelo de datos
- [ ] **`Card`:** pasar de `correctAnswer` y `wrongAnswer` a `options: [{ text, isCorrect }]`, con una sola correcta validada y la posibilidad de tener más de dos respuestas.
- [ ] **Orden del contenido:** agregar `order` a `Lesson`, `Microlearning` y `Card`, que hoy no tienen forma de definir su secuencia, único dentro de su padre. Incluir un endpoint para reordenar.
- [ ] **Progreso:** reemplazar `Learn` por dos colecciones:
  - `LessonProgress`: usuario, lección, estado, puntaje y fecha, con índice único por usuario y lección.
  - `Attempt`: usuario, tarjeta, opción elegida, si acertó y fecha.
- [ ] Desbloqueo de contenido según el avance (opcional).
- [ ] Script de datos, si en ese momento ya hay datos que conservar.

**Pendiente de decidir:**
- Si una lección se completa al ver todo su contenido o al aprobar la práctica con un puntaje mínimo.
- Si los intentos repetidos cuentan para el puntaje.

## Fase 4 — Gamificación

Primero se confirma qué motiva a los estudiantes y se empieza por lo mínimo.

| Etapa | Elementos | Qué necesita |
|---|---|---|
| Mínima | XP por acierto y por lección, niveles y racha de días | `Attempt`, `LessonProgress` y la zona horaria de Ecuador para calcular rachas |
| Siguiente | Insignias por logros | Reglas declarativas y una colección `UserBadge` |
| Opcional | Ranking semanal | Agregación o caché |

- [ ] Modelo `XpEvent` (usuario, motivo, puntos, fecha, referencia), a partir del cual se calcula el total. Evita sumar puntos dos veces y permite auditarlos.
- [ ] Los puntos se otorgan únicamente en el servidor, nunca a partir de lo que envía el cliente.
- [ ] Lógica en el módulo `gamification`, llamada desde `progress` mediante un servicio o eventos internos.
- [ ] Endpoint de resumen para el usuario: XP, nivel, racha e insignias.

**Pendiente de decidir:**
- Si el ranking es público, porque comparar a estudiantes puede desmotivar. Se recomienda que sea opcional.
- Valores de XP y curva de niveles.

## Otras mejoras a considerar

- [ ] Tests E2E de contrato que compartan fixtures con el frontend.
- [ ] Describir las respuestas en OpenAPI. Permitiría generar los tipos del frontend en lugar de escribirlos a mano.
- [ ] Recuperación de contraseña y verificación de correo.
- [ ] Definir el rol `moderator`, que existe pero hoy no tiene ningún permiso propio.
- [ ] Despliegue en producción: hoy no hay ningún ambiente publicado.
