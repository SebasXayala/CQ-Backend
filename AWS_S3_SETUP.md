# Integración con AWS S3 para Subida de Documentos

## Configuración Requerida

### 1. Variables de Entorno

Agregar las siguientes variables a tu archivo `.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu_nombre_de_bucket
```

### 2. Configuración de AWS S3

1. **Crear un bucket en S3:**
   - Ve a la consola de AWS S3
   - Crea un nuevo bucket (ej: `cq-backend-documents`)
   - Configura las políticas de acceso según tus necesidades

2. **Configurar IAM:**
   - Crea un usuario IAM con permisos para S3
   - Adjunta la política `AmazonS3FullAccess` o crea una política personalizada
   - Genera las Access Keys para el usuario

3. **Política IAM recomendada:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::tu-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::tu-bucket-name"
        }
    ]
}
```

## Endpoints Disponibles

### 1. Subir documento con archivo

```http
POST /document/upload
Content-Type: multipart/form-data

# Form data:
file: [archivo]
document_type: "pdf"
id_document_status: 1
id_folder: 1
```

### 2. Obtener URL de descarga

```http
GET /document/:id/download
```

Respuesta:
```json
{
  "downloadUrl": "https://presigned-url-to-download-file"
}
```

### 3. Reemplazar archivo de documento

```http
PATCH /document/:id/replace-file
Content-Type: multipart/form-data

# Form data:
file: [nuevo archivo]
```

### 4. Crear documento sin archivo (método original)

```http
POST /document
Content-Type: application/json

{
  "document_type": "pdf",
  "document_name": "Mi documento",
  "id_document_status": 1,
  "id_folder": 1,
  "document_url": "url_externa_opcional"
}
```

## Tipos de Archivo Permitidos

- PDF: `application/pdf`
- Imágenes: `image/jpeg`, `image/png`, `image/jpg`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## Límites

- **Tamaño máximo:** 10MB por archivo
- **Estructura de carpetas en S3:** `documents/folder_{id_folder}/{uuid}.{extension}`

## Características Implementadas

✅ **Subida de archivos a S3**
✅ **Validación de tipos de archivo**
✅ **Validación de tamaño de archivo**
✅ **URLs firmadas para descarga segura**
✅ **Eliminación de archivos de S3 al eliminar documento**
✅ **Reemplazo de archivos existentes**
✅ **Manejo de errores robusto**
✅ **Nombres únicos para archivos (UUID)**
✅ **Organización por carpetas**

## Manejo de Errores

El servicio incluye manejo completo de errores con códigos HTTP apropiados:

- `400 Bad Request`: Archivo no proporcionado, tipo no permitido, tamaño excedido
- `404 Not Found`: Documento, carpeta o estado no encontrado
- `409 Conflict`: Documento con el mismo nombre ya existe en la carpeta
- `500 Internal Server Error`: Errores de AWS S3 o base de datos

## Ejemplo de Uso con cURL

```bash
# Subir un documento
curl -X POST \
  http://localhost:3000/document/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/document.pdf' \
  -F 'document_type=pdf' \
  -F 'id_document_status=1' \
  -F 'id_folder=1'

# Obtener URL de descarga
curl -X GET http://localhost:3000/document/1/download

# Reemplazar archivo
curl -X PATCH \
  http://localhost:3000/document/1/replace-file \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/new-document.pdf'
```
