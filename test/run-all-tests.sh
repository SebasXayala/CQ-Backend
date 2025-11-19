#!/bin/bash

# Script para ejecutar todas las pruebas localmente antes de commit
# Simula lo que hará Jenkins

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  CQ Backend - Test Runner Local     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Debes ejecutar este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Función para imprimir estado
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}[1/7] Limpiando archivos anteriores...${NC}"
rm -rf coverage coverage-e2e dist
print_status $? "Limpieza completada"

echo ""
echo -e "${YELLOW}[2/7] Instalando dependencias...${NC}"
pnpm install
print_status $? "Dependencias instaladas"

echo ""
echo -e "${YELLOW}[3/7] Ejecutando linter...${NC}"
npm run lint
print_status $? "Linter ejecutado"

echo ""
echo -e "${YELLOW}[4/7] Compilando proyecto...${NC}"
npm run build
print_status $? "Compilación exitosa"

echo ""
echo -e "${YELLOW}[5/7] Ejecutando pruebas unitarias...${NC}"
npm run test:ci
UNIT_STATUS=$?
print_status $UNIT_STATUS "Pruebas unitarias completadas"

echo ""
echo -e "${YELLOW}[6/7] Ejecutando pruebas E2E...${NC}"
npm run test:e2e:ci
E2E_STATUS=$?
print_status $E2E_STATUS "Pruebas E2E completadas"

echo ""
echo -e "${YELLOW}[7/7] Generando reportes de cobertura...${NC}"
npm run test:cov
print_status $? "Reportes generados"

echo ""
echo "════════════════════════════════════════"
echo -e "${GREEN}✓ Todas las verificaciones pasaron${NC}"
echo "════════════════════════════════════════"
echo ""
echo "Reportes de cobertura:"
echo "  - Unitarias: coverage/index.html"
echo "  - E2E: coverage-e2e/index.html"
echo ""
echo -e "${GREEN}¡Listo para hacer commit!${NC}"
