# 🍕 Quadra — MVP Proyecto Universitario

## Descripción

Quadra es una aplicación web full-stack para descubrir, calificar y compartir puestos de comida callejera cerca de ti. Permite a los usuarios explorar lugares, agregar sus puestos favoritos con fotos y reseñas, y conectar con otros amantes de la buena comida.

---

## ✨ Características

- 🗺️ **Mapa interactivo** con ubicaciones de restaurantes en CDMX
- 🔍 **Búsqueda inteligente** por nombre, categoría o especialidades
- 🔐 **Autenticación JWT** con avatares aleatorios
- 📍 **Agregar lugares** haciendo click en el mapa
- 📱 **Diseño responsivo** con Mantine UI

---

## 🛠️ Tecnologías

### Backend

- **Framework:** FastAPI con Python
- **Base de datos:** PostgreSQL
- **ORM:** SQLModel
- **Conexión asíncrona:** databases con asyncpg
- **Gestión de entorno:** python-dotenv
- **Autenticación:** JWT con python-jose
- **Hash de contraseñas:** passlib[bcrypt]

### Frontend

- **Framework:** React con Vite
- **UI Library:** Mantine
- **Mapas:** Pigeon Maps
- **Estilos:** CSS Modules + PostCSS
- **Linting:** ESLint

---

## 🚀 Ejecución Rápida

### Requisitos

- Python 3.8+
- Node.js 16+
- PostgreSQL

### Configuración

1. **Base de datos:**

   ```bash
   sudo -u postgres psql
   CREATE DATABASE quadra;
   CREATE USER quadra_user WITH PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE quadra TO quadra_user;
   \q
   ```

2. **Variables de entorno:**

   Crea `backend/.env`:

   ```env
   DATABASE_USER=quadra_user
   DATABASE_PASSWORD=password123
   DATABASE_HOST=localhost
   DATABASE_NAME=quadra
   ```

3. **Instalación:**

   ```bash
   # Backend
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

   # Frontend
   cd ../frontend
   npm install
   cd ..
   ```

4. **Ejecutar:**

   ```bash
   # Terminal 1
   ./start_backend.sh

   # Terminal 2
   ./start_frontend.sh
   ```

   - Frontend: http://localhost:5173
   - API: http://localhost:8000

---

## 📊 Datos de Prueba

Incluye 10 restaurantes como Pujol, Quintonil, Rosetta, etc.

---

## 📁 Estructura del Proyecto

```
quadra/
├── backend/          # API FastAPI
│   ├── main.py       # App principal
│   ├── models.py     # Modelos de datos
│   ├── routers/      # Endpoints
│   └── ...
├── frontend/         # React app
│   └── src/
│       ├── components/
│       └── services/
└── documentation/    # Diagramas DB
```

---

## Próximos pasos

- ⏳ Implementar sistema de reseñas y calificaciones
- ⏳ Mejorar el sistema de moderación
- ⏳ Implementar paginación y filtros avanzados
- ⏳ Agregar subida de imágenes para restaurantes

---

## Contacto

Emiliano Meza — emiliano.meza.ochoa@icloud.com
