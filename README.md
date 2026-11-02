# Subrayado - Back

API REST de **Subrayado**, una red social para lectores donde se publican reseñas de libros. Trabajo Práctico #2 de Programación IV (UTN Avellaneda, Tecnicatura Universitaria en Programación).

- **Front:** https://github.com/rodrivzq14/subrayado-front
- **API desplegada:** https://subrayado-back.onrender.com
- **App desplegada:** https://subrayado-vazquez.netlify.app

> El plan gratuito de Render duerme el servicio tras un rato sin uso, por lo que la primera petición puede tardar hasta un minuto.

## Tecnologías

- NestJS
- MongoDB Atlas con Mongoose
- JWT (`@nestjs/jwt`) y un guard propio para proteger rutas
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
JWT_SECRET=un_valor_largo_y_aleatorio
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
├── autenticacion/   registro, login, DTOs, guard JWT y decorador del usuario actual
├── usuarios/        schema y servicio de usuarios
├── publicaciones/   reseñas y me gusta (schema, DTOs, servicio y controlador)
├── cloudinary/      subida de imágenes
└── common/          tipos y pipes compartidos
```

## Autenticación

Las rutas de publicaciones exigen el header `Authorization: Bearer <token>`. El token se obtiene en el registro o en el login y vence a los 15 minutos. Si falta o es inválido, la API responde `401`.

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

## Publicaciones (reseñas)

Una reseña tiene título del libro, texto, portada opcional y calificación opcional de 1 a 5.

| Método | Ruta | Descripción | Éxito |
|---|---|---|---|
| POST | `/publicaciones` | Crea una reseña (`multipart/form-data`) | 201 |
| GET | `/publicaciones` | Lista las reseñas activas | 200 |
| DELETE | `/publicaciones/:id` | Baja lógica. Solo el autor o un administrador | 200 |
| POST | `/publicaciones/:id/me-gusta` | Da me gusta (uno por usuario) | 201 |
| DELETE | `/publicaciones/:id/me-gusta` | Quita el me gusta propio | 200 |

### `POST /publicaciones`

| Campo | Obligatorio | Detalle |
|---|---|---|
| titulo | Sí | Máximo 150 caracteres |
| mensaje | Sí | Máximo 2000 caracteres |
| calificacion | No | Entero de 1 a 5 |
| imagen | No | Archivo de imagen, máximo 5 MB. Se guarda en Cloudinary |

### `GET /publicaciones`

Query params, todos opcionales:

| Parámetro | Valores | Por defecto |
|---|---|---|
| orden | `fecha` o `meGusta` | `fecha` |
| usuario | Id de un usuario, para ver solo sus reseñas | Todos |
| offset | Cantidad de reseñas a saltear | 0 |
| limit | Cantidad a traer (1 a 50) | 10 |

Respuesta:

```json
{ "items": [ { "_id": "...", "titulo": "...", "autor": { "nombreUsuario": "..." }, "cantidadMeGusta": 3, "yaLeGusto": true } ], "total": 12, "offset": 0, "limit": 5 }
```

`yaLeGusto` indica si el usuario que hace la petición ya recomendó esa reseña.

## Códigos de estado

| Código | Caso |
|---|---|
| 200 | Login, listado, baja de reseña y quitar me gusta |
| 201 | Registro, alta de reseña y dar me gusta |
| 400 | Datos inválidos, id mal formado o archivo que no es imagen |
| 401 | Credenciales incorrectas, usuario deshabilitado, o token ausente, inválido o vencido |
| 403 | Intentar eliminar la reseña de otro usuario sin ser administrador |
| 404 | La reseña no existe o ya fue dada de baja |
| 409 | Correo o usuario duplicado, me gusta repetido o quitar uno que no se dio |

## Decisiones de diseño

- **Contraseñas:** se guardan con bcrypt (10 rondas) y nunca se devuelven. El login usa `bcrypt.compare`.
- **JWT:** el payload lleva el id, el nombre de usuario y el perfil. Un guard propio lo valida y deja al usuario disponible en cada petición.
- **Baja lógica:** eliminar una reseña pone `activo: false`, y deja de aparecer en los listados.
- **Me gusta:** se guardan los ids de quienes recomendaron, y la operación es atómica, así un usuario no puede dar dos me gusta aunque lleguen dos peticiones a la vez. Un contador permite ordenar sin calcular.
- **Imágenes:** Multer las deja en memoria y se suben a Cloudinary. En la base solo queda la URL.
- **Secretos:** viven en variables de entorno. El `.env` no se sube al repositorio.

## Deploy (Render)

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start:prod`
- **Variables de entorno:** las mismas del `.env`
- En MongoDB Atlas, habilitar el acceso desde `0.0.0.0/0` en Network Access.

## Autor

Rodrigo Vazquez - Programación IV.