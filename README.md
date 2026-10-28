# Subrayado - Back

API REST de **Subrayado**, una red social para lectores donde se publican reseñas de libros. Trabajo Práctico #2 de Programación IV (UTN Avellaneda, Tecnicatura Universitaria en Programación).

- **Front:** https://github.com/rodrivzq14/subrayado-front
- **API desplegada:** _proximamente_
- **App desplegada:** _proximamente_

## Tecnologías

- NestJS
- MongoDB Atlas con Mongoose
- JWT (`@nestjs/jwt`)
- bcrypt para el hash de contraseñas
- class-validator y class-transformer para validar los datos
- Multer + Cloudinary para las imágenes

## Requisitos

- Node.js 20 o superior
- Una base en MongoDB Atlas
- Una cuenta de Cloudinary

## Instalación

```bash
git clone https://github.com/rodrivzq14/subrayado-back.git
cd subrayado-back
npm install
```

Creá un archivo `.env` en la raíz (podés copiar `.env.example`):

```
MONGO_URI=mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/subrayado?retryWrites=true&w=majority
JWT_SECRET=valor_aleatorio
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Desarrollo con recarga automática (puerto 3000) |
| `npm run build` | Compila el proyecto a `dist/` |
| `npm run start:prod` | Ejecuta la versión compilada |

## Estructura

```
src/
├── autenticacion/   registro, login, DTOs
├── usuarios/        schema y servicio de usuarios
├── publicaciones/   (se completa en el Sprint 2)
├── cloudinary/      subida de imágenes
└── common/          tipos compartidos
```

## Endpoints (Sprint 1)

### `POST /autenticacion/registro`

Body `multipart/form-data`:

| Campo | Obligatorio | Detalle |
|---|---|---|
| nombre | Sí | |
| apellido | Sí | |
| correo | Sí | Único, formato válido |
| nombreUsuario | Sí | Único |
| password | Sí | Mínimo 8 caracteres, una mayúscula y un número |
| fechaNacimiento | Sí | Formato `YYYY-MM-DD` |
| descripcion | No | Máximo 300 caracteres |
| perfil | No | `usuario` (por defecto) o `administrador` |
| imagenPerfil | No | Archivo de imagen, máximo 5 MB |

Respuesta `201`: `{ usuario, token }` (sin el campo `password`).

### `POST /autenticacion/login`

Body JSON:

```json
{ "identificador": "correo o nombre de usuario", "password": "Clave1234" }
```

Respuesta `200`: `{ usuario, token }`.

## Códigos de estado

| Código | Caso |
|---|---|
| 201 | Registro exitoso |
| 200 | Login exitoso |
| 400 | Datos inválidos o archivo que no es imagen |
| 401 | Credenciales incorrectas o usuario deshabilitado |
| 409 | Correo o nombre de usuario ya registrado |

## Seguridad

- Las contraseñas se guardan hasheadas con bcrypt (10 rondas) y nunca se devuelven en las respuestas.
- El JWT incluye el id, el nombre de usuario y el perfil, y vence a los 15 minutos.
- Los secretos viven en variables de entorno. El `.env` no se sube al repositorio.

## Deploy (Render)

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start:prod`
- **Variables de entorno:** las mismas del `.env`
- En MongoDB Atlas, habilitar el acceso desde `0.0.0.0/0` en Network Access.

El plan gratuito de Render duerme el servicio tras un rato sin uso, así que la primera petición puede tardar hasta un minuto.

## Autor

Rodrigo Vazquez - Programación IV, 4º cuatrimestre.
