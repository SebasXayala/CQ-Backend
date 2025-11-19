# ===== STAGE 1: BUILD =====
FROM node:20-alpine AS builder

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar todo el código fuente
COPY . .

# Construir la aplicación
RUN pnpm run build

# ===== STAGE 2: PRODUCTION (Para contenedores normales) =====
FROM node:20-alpine AS production

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar build desde stage anterior
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main.js"]

# ===== STAGE 3: LAMBDA (Para AWS Lambda) =====
FROM public.ecr.aws/lambda/nodejs:20 AS lambda

# Copiar build desde stage builder
COPY --from=builder /app/dist ${LAMBDA_TASK_ROOT}/dist
COPY --from=builder /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=builder /app/package.json ${LAMBDA_TASK_ROOT}/

# Comando Lambda handler
CMD ["dist/lambda.handler"]
