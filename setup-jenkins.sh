#!/bin/bash

# Script interactivo para configurar Jenkins - CQ Backend
# Uso: ./setup-jenkins.sh

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🚀 Setup Interactivo de Jenkins - CQ Backend           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para hacer pausa
pause() {
    echo ""
    read -p "Presiona ENTER para continuar..."
    echo ""
}

# Verificar si Jenkins está instalado
check_jenkins() {
    echo -e "${YELLOW}▶ Verificando instalación de Jenkins...${NC}"
    
    if systemctl is-active --quiet jenkins 2>/dev/null; then
        echo -e "${GREEN}✅ Jenkins está instalado y corriendo${NC}"
        JENKINS_URL="http://localhost:8080"
        echo -e "   URL: ${GREEN}${JENKINS_URL}${NC}"
        return 0
    else
        echo -e "${RED}❌ Jenkins no está instalado o no está corriendo${NC}"
        return 1
    fi
}

# Paso 1: Verificar/Instalar Jenkins
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 1: Verificar Jenkins${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ! check_jenkins; then
    echo ""
    echo -e "${YELLOW}¿Deseas instalar Jenkins? (s/n)${NC}"
    read -r INSTALL_JENKINS
    
    if [[ "$INSTALL_JENKINS" == "s" || "$INSTALL_JENKINS" == "S" ]]; then
        echo ""
        echo -e "${YELLOW}Instalando Jenkins...${NC}"
        
        # Detectar sistema operativo
        if [[ -f /etc/debian_version ]]; then
            echo "Sistema: Debian/Ubuntu"
            wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
            sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
            sudo apt update
            sudo apt install -y jenkins
        elif [[ -f /etc/redhat-release ]]; then
            echo "Sistema: RedHat/CentOS"
            sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
            sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
            sudo yum install -y jenkins
        else
            echo -e "${RED}Sistema operativo no soportado. Instala Jenkins manualmente:${NC}"
            echo "https://www.jenkins.io/doc/book/installing/"
            exit 1
        fi
        
        # Iniciar Jenkins
        sudo systemctl start jenkins
        sudo systemctl enable jenkins
        
        echo ""
        echo -e "${GREEN}✅ Jenkins instalado y iniciado${NC}"
        echo ""
        echo -e "${YELLOW}⏳ Esperando a que Jenkins inicie (puede tomar 30-60 segundos)...${NC}"
        sleep 30
        
        # Mostrar password inicial
        echo ""
        echo -e "${BLUE}🔑 Password inicial de Jenkins:${NC}"
        echo -e "${GREEN}"
        sudo cat /var/lib/jenkins/secrets/initialAdminPassword
        echo -e "${NC}"
        echo ""
        echo -e "${YELLOW}⚠️ IMPORTANTE: Guarda este password, lo necesitarás en el navegador${NC}"
        
        pause
    else
        echo -e "${RED}No se puede continuar sin Jenkins. Saliendo...${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${GREEN}Jenkins ya está instalado. Continuando...${NC}"
fi

pause

# Paso 2: Abrir Jenkins en navegador
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 2: Configuración Inicial de Jenkins${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Abre Jenkins en tu navegador:${NC}"
echo -e "${GREEN}http://localhost:8080${NC}"
echo ""
echo "En el navegador:"
echo "1. Pega el password inicial"
echo "2. Click en 'Install suggested plugins'"
echo "3. Crea tu usuario administrador"
echo "4. Click 'Save and Finish'"
echo "5. Click 'Start using Jenkins'"
echo ""

pause

# Paso 3: Instalar plugins adicionales
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 3: Instalar Plugins Necesarios${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "En Jenkins UI, ve a:"
echo -e "${YELLOW}Manage Jenkins > Manage Plugins > Available${NC}"
echo ""
echo "Busca e instala estos plugins (si no están instalados):"
echo "  ☑ Pipeline"
echo "  ☑ Git"
echo "  ☑ NodeJS Plugin"
echo "  ☑ Credentials Binding Plugin"
echo ""
echo "Después de instalar, reinicia Jenkins si es necesario."
echo ""

pause

# Paso 4: Configurar Node.js
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 4: Configurar Node.js en Jenkins${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "En Jenkins UI, ve a:"
echo -e "${YELLOW}Manage Jenkins > Global Tool Configuration${NC}"
echo ""
echo "En la sección 'NodeJS':"
echo "  1. Click 'Add NodeJS'"
echo "  2. Name: ${GREEN}Node 22${NC}"
echo "  3. ☑ Install automatically"
echo "  4. Version: ${GREEN}NodeJS 22.x${NC} (o la más reciente)"
echo "  5. Global npm packages: ${GREEN}pnpm@latest${NC}"
echo "  6. Click 'Save'"
echo ""

pause

# Paso 5: Preparar credenciales
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 5: Configurar Credenciales${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Necesitamos 6 credenciales en Jenkins:${NC}"
echo ""

# Pedir credenciales
echo -e "${GREEN}1/6: DATABASE_URL${NC}"
read -p "   Ingresa tu DATABASE_URL: " DB_URL
echo ""

echo -e "${GREEN}2/6: JWT_SECRET${NC}"
read -p "   Ingresa tu JWT_SECRET: " JWT_SECRET
echo ""

echo -e "${GREEN}3/6: JWT_SECRET_CANDIDATE${NC}"
read -p "   Ingresa tu JWT_SECRET_CANDIDATE: " JWT_SECRET_CANDIDATE
echo ""

echo -e "${GREEN}4/6: AWS_ACCESS_KEY_ID${NC}"
read -p "   Ingresa tu AWS_ACCESS_KEY_ID: " AWS_KEY
echo ""

echo -e "${GREEN}5/6: AWS_SECRET_ACCESS_KEY${NC}"
read -sp "   Ingresa tu AWS_SECRET_ACCESS_KEY: " AWS_SECRET
echo ""
echo ""

echo -e "${GREEN}6/6: AWS_S3_BUCKET${NC}"
read -p "   Ingresa tu AWS_S3_BUCKET: " S3_BUCKET
echo ""

# Guardar en archivo temporal (opcional)
cat > /tmp/jenkins-credentials.txt << EOF
===========================================
CREDENCIALES PARA JENKINS
===========================================

Copia y pega estas credenciales en Jenkins UI

En: Manage Jenkins > Manage Credentials > (global) > Add Credentials

-------------------------------------------
1. DATABASE_URL
-------------------------------------------
Kind: Secret text
Secret: ${DB_URL}
ID: cq-backend-database-url
Description: Database connection string

-------------------------------------------
2. JWT_SECRET
-------------------------------------------
Kind: Secret text
Secret: ${JWT_SECRET}
ID: cq-backend-jwt-secret
Description: JWT secret for users

-------------------------------------------
3. JWT_SECRET_CANDIDATE
-------------------------------------------
Kind: Secret text
Secret: ${JWT_SECRET_CANDIDATE}
ID: cq-backend-jwt-secret-candidate
Description: JWT secret for candidates

-------------------------------------------
4. AWS_ACCESS_KEY_ID
-------------------------------------------
Kind: Secret text
Secret: ${AWS_KEY}
ID: cq-backend-aws-access-key
Description: AWS Access Key

-------------------------------------------
5. AWS_SECRET_ACCESS_KEY
-------------------------------------------
Kind: Secret text
Secret: ${AWS_SECRET}
ID: cq-backend-aws-secret-key
Description: AWS Secret Key

-------------------------------------------
6. AWS_S3_BUCKET
-------------------------------------------
Kind: Secret text
Secret: ${S3_BUCKET}
ID: cq-backend-s3-bucket
Description: S3 bucket name

===========================================
EOF

echo ""
echo -e "${GREEN}✅ Credenciales guardadas en: ${YELLOW}/tmp/jenkins-credentials.txt${NC}"
echo ""
echo -e "${YELLOW}Ahora ve a Jenkins UI:${NC}"
echo -e "${YELLOW}Manage Jenkins > Manage Credentials > (global) > Add Credentials${NC}"
echo ""
echo "Para cada credencial:"
echo "  1. Kind: ${GREEN}Secret text${NC}"
echo "  2. Scope: ${GREEN}Global${NC}"
echo "  3. Secret: ${GREEN}[copia el valor de arriba]${NC}"
echo "  4. ID: ${GREEN}[usa el ID exacto de arriba]${NC}"
echo "  5. Description: ${GREEN}[descripción]${NC}"
echo "  6. Click 'OK'"
echo ""
echo -e "${BLUE}TIP: Puedes ver las credenciales en: cat /tmp/jenkins-credentials.txt${NC}"
echo ""

pause

# Paso 6: Crear Pipeline Job
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 6: Crear Pipeline Job${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "En Jenkins Dashboard:"
echo ""
echo "  1. Click '${GREEN}New Item${NC}'"
echo "  2. Nombre: ${GREEN}CQ-Backend-E2E-Tests${NC}"
echo "  3. Tipo: ${GREEN}Pipeline${NC}"
echo "  4. Click 'OK'"
echo ""
echo "En la configuración del Pipeline:"
echo ""
echo "  ${YELLOW}Pipeline:${NC}"
echo "    • Definition: ${GREEN}Pipeline script from SCM${NC}"
echo "    • SCM: ${GREEN}Git${NC}"
echo "    • Repository URL: ${GREEN}https://github.com/SebasXayala/CQ-Backend.git${NC}"
echo "    • Branch: ${GREEN}*/main${NC}"
echo "    • Script Path: ${GREEN}Jenkinsfile${NC}"
echo ""
echo "  ${YELLOW}Build Triggers (opcional):${NC}"
echo "    • ☑ Poll SCM: ${GREEN}H/5 * * * *${NC} (cada 5 minutos)"
echo ""
echo "  6. Click '${GREEN}Save${NC}'"
echo ""

pause

# Paso 7: Ejecutar primer build
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 7: Ejecutar Primer Build${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "En el Pipeline Job que acabas de crear:"
echo ""
echo "  1. Click '${GREEN}Build Now${NC}'"
echo "  2. Espera a que aparezca el build #1 en 'Build History'"
echo "  3. Click en '${GREEN}#1${NC}'"
echo "  4. Click en '${GREEN}Console Output${NC}' para ver el progreso"
echo ""
echo -e "${YELLOW}Resultado esperado:${NC}"
echo "  ✅ 48/48 tests passing"
echo "  ✅ Build exitoso (bola azul)"
echo "  ⏱️ Tiempo estimado: 2-3 minutos"
echo ""

pause

# Paso 8: Verificación final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 8: Verificación Final${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Setup Completo!${NC}"
echo ""
echo "Verifica que todo esté funcionando:"
echo ""
echo "  1. ✅ Jenkins accesible en http://localhost:8080"
echo "  2. ✅ 6 credenciales configuradas"
echo "  3. ✅ Node.js 22 configurado"
echo "  4. ✅ Pipeline Job creado"
echo "  5. ✅ Primer build ejecutado exitosamente"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📚 Documentación adicional:${NC}"
echo "  • Setup detallado: ${GREEN}docs/JENKINS-SETUP.md${NC}"
echo "  • Plan de tests: ${GREEN}docs/TEST-PLAN.md${NC}"
echo "  • Integration guide: ${GREEN}docs/JENKINS-INTEGRATION.md${NC}"
echo "  • Credenciales guardadas: ${GREEN}/tmp/jenkins-credentials.txt${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Jenkins está listo para CI/CD!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
