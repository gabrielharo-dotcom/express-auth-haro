# Express Auth Haro

API del laboratorio 7 desplegada para la tarea 2 del laboratorio 8.

- Aplicacion: https://express-auth-haro.onrender.com
- Repositorio: https://github.com/gabrielharo-dotcom/express-auth-haro
- Base de datos: MongoDB Atlas, `auth_haro_db`.

## Desarrollo

Copiar `.env.example` a `.env` y completar la URI de Atlas y una clave JWT privada. No subir `.env` al repositorio.

```sh
npm ci
npm test
npm start
```

## API

- `GET /health`: estado del servicio.
- `POST /api/auth/signUp`: registro de usuario.
- `POST /api/auth/signIn`: inicio de sesion y token JWT.
- `GET /api/users/me`: perfil, requiere `Authorization: Bearer <token>`.
- `GET /api/users`: listado, requiere rol administrador.

La contrasena requiere al menos 8 caracteres, una mayuscula, un numero y un simbolo permitido.

## Despliegue automatico

GitHub Actions instala dependencias, valida JavaScript y ejecuta pruebas HTTP de la API y proteccion JWT. Si pasan en `main`, activa Render mediante el secreto `RENDER_DEPLOY_HOOK_URL`. Render ejecuta `npm ci --omit=dev` y `npm start`; las variables privadas se configuran en su panel Environment.

## Evidencias

Capturar la aplicacion en el navegador, inicio de sesion y acceso protegido en Postman, ejecucion exitosa de GitHub Actions, despliegue Live en Render y coleccion `users` de `auth_haro_db` en Compass.
