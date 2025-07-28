#!/bin/bash

# Script para iniciar el frontend de Quadra
# Este script ejecuta el servidor de desarrollo de Vite

echo "🎨 Iniciando frontend de Quadra..."

# Obtener el directorio actual del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cambiar al directorio del frontend
cd frontend

# Verificar si node_modules existe, si no, instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
else
    echo "✅ Dependencias ya instaladas"
fi

echo "🌐 Iniciando servidor de desarrollo en http://localhost:5174..."
npm run dev
