#!/bin/bash

# Script para iniciar el backend de Quadra
# Este script activa el entorno virtual y ejecuta uvicorn desde la ruta correcta

echo "🚀 Iniciando backend de Quadra..."

# Obtener el directorio actual del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Verificar si existe el entorno virtual
if [ ! -d "backend/.venv" ]; then
    echo "❌ Error- No se encontró el entorno virtual en backend/.venv"
    echo "   Ejecuta primero: cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activar el entorno virtual que está en backend/
source backend/.venv/bin/activate

echo "✅ Entorno virtual activado"

# Verificar si existe el archivo .env
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Advertencia: No se encontró backend/.env"
    echo "   Copia backend/.env.example a backend/.env y configura las variables de entorno"
fi

# Ejecutar uvicorn desde la ruta App con el path correcto
echo "🌐 Iniciando servidor FastAPI en http://localhost:8000..."
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
