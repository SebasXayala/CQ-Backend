#!/bin/bash

# Script rápido para iniciar Jenkins con Docker
# Uso: ./start-jenkins-docker.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🐳 Jenkins con Docker - Setup Rápido                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo ""
    echo "Instala Docker primero:"
    echo "  Ubuntu: sudo apt install docker.io"
    echo "  O visita: https://docs.docker.com/engine/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker instalado${NC}"
echo ""

# Verificar si Jenkins ya está corriendo
if docker ps | grep -q jenkins; then
    echo -e "${YELLOW}⚠️  Jenkins ya está corriendo${NC}"
    echo ""
    echo -e "URL: ${GREEN}http://localhost:8080${NC}"
    echo ""
    echo "Comandos útiles:"
    echo "  Ver logs:     ${YELLOW}docker logs -f jenkins${NC}"
    echo "  Detener:      ${YELLOW}docker stop jenkins${NC}"
    echo "  Reiniciar:    ${YELLOW}docker restart jenkins${NC}"
    echo "  Eliminar:     ${YELLOW}docker rm -f jenkins${NC}"
    exit 0
fi

# Verificar si existe contenedor detenido
if docker ps -a | grep -q jenkins; then
    echo -e "${YELLOW}Jenkins existe pero está detenido. Iniciando...${NC}"
    docker start jenkins
    echo -e "${GREEN}✅ Jenkins iniciado${NC}"
    echo ""
    echo -e "URL: ${GREEN}http://localhost:8080${NC}"
    exit 0
fi

# Crear directorio para datos
echo -e "${YELLOW}📁 Creando directorio para datos de Jenkins...${NC}"
mkdir -p ~/jenkins_home
echo -e "${GREEN}✅ Directorio creado: ~/jenkins_home${NC}"
echo ""

# Iniciar Jenkins
echo -e "${YELLOW}🐳 Iniciando Jenkins en Docker...${NC}"
echo ""

docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

echo -e "${GREEN}✅ Jenkins iniciado exitosamente${NC}"
echo ""

# Esperar a que Jenkins inicie
echo -e "${YELLOW}⏳ Esperando a que Jenkins inicie (30 segundos)...${NC}"
sleep 30

# Obtener password inicial
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔑 PASSWORD INICIAL DE JENKINS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚠️  GUARDA ESTE PASSWORD - Lo necesitarás en el navegador${NC}"
echo ""
echo -e "${GREEN}🌐 Abre Jenkins en tu navegador:${NC}"
echo -e "${BLUE}   http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}📋 Sigue la guía paso a paso:${NC}"
echo -e "   ${GREEN}cat INSTALAR-JENKINS.md${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:     ${YELLOW}docker logs -f jenkins${NC}"
echo "  Detener:      ${YELLOW}docker stop jenkins${NC}"
echo "  Reiniciar:    ${YELLOW}docker restart jenkins${NC}"
echo "  Eliminar:     ${YELLOW}docker rm -f jenkins${NC}"
echo ""
echo -e "${GREEN}✅ Jenkins está listo!${NC}"
echo ""
