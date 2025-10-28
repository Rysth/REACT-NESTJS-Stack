# REACT-NESTJS Stack

Creado por [RysthDesign](https://rysthdesign.com/)
Un stack completo con React (frontend) y NestJS API (backend) en un solo repositorio monorepo.

## 🚀 Inicio Rápido
### Requisitos
- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Git

### Configuración Automática

1. **Clona el repositorio:**
```bash
git clone git@github.com:Rysth/REACT-NESTJS-Stack.git
cd REACT-NESTJS-Stack
```

2. **Ejecuta el script de configuración:**
```bash
chmod +x setup.sh
./setup.sh
```

El script automáticamente:
- Crea `.env` desde `.env.example` si no existe
- (Opcional) Levanta servicios definidos en Docker Compose

3. **Accede a las aplicaciones:**
- Frontend (React): http://localhost:5173
- Backend (NestJS API): http://localhost:3000 (se añadirá en el siguiente paso de backend)

## 📁 Estructura del Proyecto

```
REACT-NESTJS-Stack/
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── server/                 # Backend NestJS API (pendiente de agregar)
│   └── (se agregará en una etapa posterior)
├── docker-compose.dev.yml # Configuración Docker
├── .env.example          # Variables de entorno
├── setup.sh             # Script de configuración
└── README.md
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Levantar todos los servicios
./setup.sh

# Levantar servicios manualmente (si están definidos)
docker compose -f docker-compose.dev.yml up

# Detener servicios
docker compose -f docker-compose.dev.yml down

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Reconstruir contenedores
docker compose -f docker-compose.dev.yml up --build
```

### Base de Datos
Las instrucciones de base de datos dependen de la implementación del backend NestJS (por ejemplo, Prisma/TypeORM). Una vez agregado el backend, se documentarán aquí los comandos de migración/seed.

### Administración
Pendiente de agregar tras integrar el backend NestJS (p. ej., scripts de seed, cuentas admin, etc.).

## ⚙️ Configuración

### Variables de Entorno
Copia `.env.example` a `.env` y ajusta las variables según tu entorno:

```bash
cp .env.example .env
```

### Configuraciones Importantes
- `VITE_API_URL` - URL de la API para el frontend
- Variables de backend (p. ej., `DATABASE_URL`, `REDIS_URL`) se definirán según la implementación NestJS (Prisma/TypeORM, cache, etc.).

## 🐳 Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| client | 5173 | Frontend React |
| server (NestJS) | 3000 | Backend NestJS API (pendiente) |
| postgres | 5432 | Base de datos PostgreSQL (opcional) |
| redis | 6379 | Cache (opcional) |

## 🔍 Desarrollo

### Frontend (React)
```bash
cd client
bun install
bun run dev
```

### Backend (NestJS)
El backend NestJS aún no está en este repositorio. Cuando se agregue:
```bash
cd server
npm install   # o pnpm/bun/yarn
npm run start:dev
```

## 📝 Notas

- **Estructura monorepo**: Este repositorio contiene frontend y (próximamente) backend en carpetas separadas
- **Hot reloading**: Los servicios soportarán recarga automática durante el desarrollo
- **Persistencia**: Los datos de PostgreSQL/Redis (si se usan) pueden mantenerse en volúmenes Docker

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Creado por [RysthDesign](https://rysthdesign.com/)
# REACT-NESTJS Stack

Un stack completo con React (frontend) y NestJS API (backend) en un solo repositorio monorepo.

## 🚀 Inicio Rápido

### Requisitos
- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Git

### Configuración Automática

1. **Clona el repositorio:**
```bash
git clone git@github.com:Rysth/REACT-NESTJS-Stack.git
cd REACT-NESTJS-Stack
```

2. **Ejecuta el script de configuración:**
```bash
chmod +x setup.sh
./setup.sh
```

El script automáticamente:
- Crea `.env` desde `.env.example` si no existe
- (Opcional) Levanta servicios definidos en Docker Compose

3. **Accede a las aplicaciones:**
- Frontend (React): http://localhost:5173
- Backend (NestJS API): http://localhost:3000 (se añadirá en el siguiente paso de backend)

## 📁 Estructura del Proyecto

```
REACT-NESTJS-Stack/
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── server/                 # Backend NestJS API (pendiente de agregar)
│   └── (se agregará en una etapa posterior)
├── docker-compose.dev.yml # Configuración Docker
├── .env.example          # Variables de entorno
├── setup.sh             # Script de configuración
└── README.md
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Levantar todos los servicios
./setup.sh

# Levantar servicios manualmente (si están definidos)
docker compose -f docker-compose.dev.yml up

# Detener servicios
docker compose -f docker-compose.dev.yml down

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Reconstruir contenedores
docker compose -f docker-compose.dev.yml up --build
```

### Base de Datos
Las instrucciones de base de datos dependen de la implementación del backend NestJS (por ejemplo, Prisma/TypeORM). Una vez agregado el backend, se documentarán aquí los comandos de migración/seed.

### Administración
Pendiente de agregar tras integrar el backend NestJS (p. ej., scripts de seed, cuentas admin, etc.).

## ⚙️ Configuración

### Variables de Entorno
Copia `.env.example` a `.env` y ajusta las variables según tu entorno:

```bash
cp .env.example .env
```

### Configuraciones Importantes
- `VITE_API_URL` - URL de la API para el frontend
- Variables de backend (p. ej., `DATABASE_URL`, `REDIS_URL`) se definirán según la implementación NestJS (Prisma/TypeORM, cache, etc.).

## 🐳 Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| client | 5173 | Frontend React |
| server (NestJS) | 3000 | Backend NestJS API (pendiente) |
| postgres | 5432 | Base de datos PostgreSQL (opcional) |
| redis | 6379 | Cache (opcional) |

## 🔍 Desarrollo

### Frontend (React)
```bash
cd client
bun install
bun run dev
```

### Backend (NestJS)
El backend NestJS aún no está en este repositorio. Cuando se agregue:
```bash
cd server
npm install   # o pnpm/bun/yarn
npm run start:dev
```

## 📝 Notas

- **Estructura monorepo**: Este repositorio contiene frontend y (próximamente) backend en carpetas separadas
- **Hot reloading**: Los servicios soportarán recarga automática durante el desarrollo
- **Persistencia**: Los datos de PostgreSQL/Redis (si se usan) pueden mantenerse en volúmenes Docker

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Creado por [RysthDesign](https://rysthdesign.com/)
