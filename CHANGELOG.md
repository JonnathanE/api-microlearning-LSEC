# Changelog

## 3.0.0 (2026-11-02)

### Cambios que afectan al frontend

| Antes | Ahora | Qué ajustar en el frontend |
|---|---|---|
| Errores `{ error }` o `{ message }` según el endpoint | Siempre `{ error, code, details? }` | `SignUp` lee `data.message`: debe leer `data.error` |
| Crear responde 200 | Crear responde 201 (`signup`, módulo, lección, microcontenido, tarjeta) | Nada, si solo se comprueba que no haya error |
| Eliminar responde 200 con `{ message }` | Eliminar responde 204 sin cuerpo | No leer el cuerpo |
| Recurso inexistente responde 400 | 404 si no existe; 400 si el id no es válido | Revisar las pantallas que comparan el estado |
| Duplicado responde 400 | 409 | `AddModule` compara con 400: debe comparar con 409 |
| Sin token responde 403 | 401 | Nada: las pantallas ya tratan 401 como sesión terminada |
| `signin` con correo desconocido responde 400 | 401 con el mismo mensaje que una contraseña errónea | Nada |
| `signinadmin` sin rol de admin responde 401 | 403 | Nada: `LoginAdmin` no compara el estado |
| Eliminar módulos o lecciones con contenido dejaba huérfanos | 409 si tienen lecciones, microcontenidos o tarjetas | Mostrar `data.error` al administrador |
| `signup` aceptaba `roles` | Se ignoran: siempre `student` | Los roles se cambian con `PUT /api/user/:userId/roles` |
| Contraseñas sin mínimo | Mínimo 8 caracteres en `signup` y al cambiarla | Agregar la validación en los formularios |
| Crear una lección sin ícono, un microcontenido sin imagen o GIF o una tarjeta sin GIF podía aceptarse | 400 | Los formularios ya los exigen |
| Archivos de cualquier tipo | Solo PNG, JPEG, GIF y WEBP (ícono: 1 MB; resto: 10 MB). Si se excede: 413 | Revisar los formularios |
| `GET /api/lesson/icon/:id` devolvía el archivo | Redirección 302 a Cloudinary. La lección trae `icon_url` | Conviene usar `icon_url.url` |
| `GET /api/micro/image/:id`, `/api/micro/gif/:id`, `/api/card/gif/:id` | Eliminados | Nada: no se usan |
| `POST /api/auth/signout` y cookie `t` | Eliminados: la sesión es solo el token | Nada: no se usan |
| Campos `icon`, `image`, `gif` (Buffer) y `Card.options` | Eliminados | Nada: no se usan |
| `/home/learn/:id?page=` y `/home/card/:id?page=` sin contenido respondían 200 con `docs` vacío | 404 | Mostrar un estado vacío |
| `PUT /api/home/complete/lesson/:id` devolvía el resultado de la base en `message` | `message` es un texto | Nada: no se usa |
| CORS abierto a cualquier origen | Solo `CORS_ORIGINS` | Configurar el origen del frontend |
| `?sortBy=` y `?order=` libres | Lista blanca; valores no permitidos responden 400 | Nada: no se usan |

Los mensajes con errores de escritura se corrigieron (por ejemplo, "se actualizado" pasa a "se actualizó").
