# 📋 Guía para Probar Endpoints de Documentos con S3 en Postman

## 🚀 Preparación Inicial

1. **Asegúrate de que el servidor esté corriendo:**
   ```bash
   pnpm run start:dev
   ```

2. **URL Base:** `http://localhost:3000/api/v1`

---

## 📁 **1. Subir Documento con Archivo (POST /api/v1/document/upload)**

### Configuración en Postman:

**Method:** `POST`  
**URL:** `http://localhost:3000/api/v1/document/upload`

### Headers:
- **NO agregues** `Content-Type` (Postman lo manejará automáticamente para multipart/form-data)

### Body:
Selecciona **form-data** y agrega los siguientes campos:

| Key | Type | Value | Descripción |
|-----|------|-------|-------------|
| `file` | File | Seleccionar archivo | El archivo a subir (PDF, imagen, Word, Excel) |
| `document_type` | Text | `pdf` | Tipo de documento |
| `id_document_status` | Text | `1` | ID del estado del documento |
| `id_folder` | Text | `1` | ID de la carpeta |

### Ejemplo de Response:
```json
{
  "id_document": 1,
  "document_type": "pdf",
  "document_name": "mi-archivo.pdf",
  "id_document_status": 1,
  "id_folder": 1,
  "document_url": "https://bucket.gestionhumana.cq2025.s3.us-east-2.amazonaws.com/documents/folder_1/uuid-123.pdf",
  "modification_date": "2025-01-23T10:30:00.000Z"
}
```

---

## 📄 **2. Obtener Todos los Documentos (GET /api/v1/document)**

### Configuración en Postman:

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/document`

### Headers:
```
Content-Type: application/json
```

### Response:
```json
[
  {
    "id_document": 1,
    "document_type": "pdf",
    "document_name": "mi-archivo.pdf",
    "id_document_status": 1,
    "id_folder": 1,
    "document_url": "https://bucket.gestionhumana.cq2025.s3...",
    "modification_date": "2025-01-23T10:30:00.000Z",
    "documentStatus": {
      "id_document_status": 1,
      "status": "Pendiente",
      "description": "Documento pendiente de revisión"
    },
    "folder": {
      "id_folder": 1,
      "folder_name": "Carpeta Candidato 1"
    }
  }
]
```

---

## 🔍 **3. Obtener Documento por ID (GET /api/v1/document/:id)**

### Configuración en Postman:

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/document/1`

### Headers:
```
Content-Type: application/json
```

---

## 📂 **4. Obtener Documentos por Carpeta (GET /api/v1/document/folder/:folderId)**

### Configuración en Postman:

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/document/folder/1`

### Headers:
```
Content-Type: application/json
```

---

## ⬇️ **5. Obtener URL de Descarga (GET /api/v1/document/:id/download)**

### Configuración en Postman:

**Method:** `GET`  
**URL:** `http://localhost:3000/api/v1/document/1/download`

### Headers:
```
Content-Type: application/json
```

### Response:
```json
{
  "downloadUrl": "https://bucket.gestionhumana.cq2025.s3.us-east-2.amazonaws.com/documents/folder_1/uuid-123.pdf?AWSAccessKeyId=...&Expires=...&Signature=..."
}
```

**Nota:** La URL firmada expira en 1 hora por defecto.

---

## 🔄 **6. Reemplazar Archivo (PATCH /api/v1/document/:id/replace-file)**

### Configuración en Postman:

**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/v1/document/1/replace-file`

### Headers:
- **NO agregues** `Content-Type`

### Body:
Selecciona **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `file` | File | Nuevo archivo |

---

## ✏️ **7. Actualizar Documento (PATCH /api/v1/document/:id)**

### Configuración en Postman:

**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/v1/document/1`

### Headers:
```
Content-Type: application/json
```

### Body (raw JSON):
```json
{
  "document_type": "word",
  "id_document_status": 2
}
```

---

## 🗑️ **8. Eliminar Documento (DELETE /api/v1/document/:id)**

### Configuración en Postman:

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/v1/document/1`

### Headers:
```
Content-Type: application/json
```

**Nota:** Esto eliminará tanto el registro de la BD como el archivo de S3.

---

## 🔧 **Colección de Postman**

Puedes importar esta colección JSON en Postman:

```json
{
  "info": {
    "name": "CQ Backend - Documents S3",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Document",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            },
            {
              "key": "document_type",
              "value": "pdf",
              "type": "text"
            },
            {
              "key": "id_document_status",
              "value": "1",
              "type": "text"
            },
            {
              "key": "id_folder",
              "value": "1",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{base_url}}/api/v1/document/upload",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "document", "upload"]
        }
      }
    },
    {
      "name": "Get All Documents",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/v1/document",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "document"]
        }
      }
    },
    {
      "name": "Get Download URL",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/v1/document/1/download",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "document", "1", "download"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## ⚠️ **Posibles Errores y Soluciones**

### Error 400: "No se proporcionó ningún archivo"
- **Solución:** Asegúrate de seleccionar un archivo en el campo `file` de form-data

### Error 400: "Tipo de archivo no permitido"
- **Solución:** Usa archivos PDF, imágenes (JPG, PNG), Word (.doc, .docx) o Excel (.xls, .xlsx)

### Error 400: "El archivo es demasiado grande"
- **Solución:** El archivo debe ser menor a 10MB

### Error 404: "No se encontró la carpeta"
- **Solución:** Asegúrate de que existe una carpeta con el `id_folder` especificado

### Error 500: "Error al subir el archivo"
- **Solución:** Verifica las credenciales de AWS y que el bucket existe

---

## 🎯 **Prueba Paso a Paso**

1. **Primer paso:** Crear estado de documento y carpeta (si no existen)
2. **Segundo paso:** Subir un documento con `/document/upload`
3. **Tercer paso:** Verificar que se creó con `/document`
4. **Cuarto paso:** Obtener URL de descarga con `/document/1/download`
5. **Quinto paso:** Copiar la URL y abrirla en el navegador para confirmar la descarga

¿Te gustaría que te ayude con algún endpoint específico o tienes algún error particular?
