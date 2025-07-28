# 🍕 Quadra - Restaurant Discovery App

Aplicación web full-stack para descubrir restaurantes en la Ciudad de México con mapa interactivo, búsqueda avanzada y sistema de autenticación.

## ✨ Características

- 🗺️ **Mapa interactivo** con ubicaciones de restaurantes
- 🔍 **Búsqueda inteligente** por nombre, categoría o especialidades
- 🔐 **Autenticación JWT** con avatares aleatorios
- 📍 **Agregar lugares** haciendo click en el mapa
- 📱 **Diseño responsivo** con Mantine UI

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
   python create_tables.py
   python create_sample_data.py

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

   - Frontend: http://localhost:5174
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs

## 🛠️ Stack

- **Backend:** FastAPI + SQLModel + PostgreSQL
- **Frontend:** React + Mantine + Vite + Pigeon Maps

## 📊 Datos de Prueba

Usuario: `admin@quadra.com` / `123456`

Incluye 10 restaurantes de CDMX como Pujol, Quintonil, Rosetta, etc.

## 📁 Estructura

```
App/
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
