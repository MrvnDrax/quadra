#!/bin/bash

# Script de configuración inicial para Quadra
# Este script configura todo el entorno desde cero

echo "🏗️  Configuración inicial de Quadra"
echo "=================================="

# Obtener el directorio actual del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar requisitos previos
echo "🔍 Verificando requisitos previos..."

if ! command_exists python3; then
    echo "❌ Python 3 no está instalado. Instálalo primero."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js no está instalado. Instálalo primero."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm no está instalado. Instálalo primero."
    exit 1
fi

if ! command_exists psql; then
    echo "⚠️  PostgreSQL no está disponible. Asegúrate de instalarlo y configurarlo."
fi

echo "✅ Requisitos básicos verificados"

# Configurar backend
echo ""
echo "🐍 Configurando backend Python..."
cd backend

# Crear entorno virtual si no existe
if [ ! -d ".venv" ]; then
    echo "   Creando entorno virtual..."
    python3 -m venv .venv
fi

# Activar entorno virtual
source .venv/bin/activate

# Instalar dependencias
echo "   Instalando dependencias Python..."
pip install --upgrade pip
pip install -r requirements.txt

# Configurar archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "   Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "   ⚠️  IMPORTANTE: Edita backend/.env con tus credenciales de PostgreSQL"
fi

cd ..

# Configurar frontend
echo ""
echo "⚛️  Configurando frontend React..."
cd frontend

# Instalar dependencias de Node.js
echo "   Instalando dependencias Node.js..."
npm install

cd ..

# Instrucciones finales
echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Configura tu base de datos PostgreSQL"
echo "   2. Edita backend/.env con tus credenciales de base de datos"
echo "   3. Ejecuta la inicialización de la base de datos:"
echo "      cd backend && source .venv/bin/activate"
echo "      python create_tables.py"
echo "      python create_sample_data.py"
echo "   4. Ejecuta la aplicación:"
echo "      ./start_backend.sh    (en una terminal)"
echo "      ./start_frontend.sh   (en otra terminal)"
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
