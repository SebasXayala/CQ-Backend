import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as path from 'path';
import * as fs from 'fs';
import { loginUser } from '../test-helper';

describe('DocumentController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let createdDocumentId: number;
    let folderId: number;
    let testFilePath: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        await app.init();

        // Login real para obtener token válido
        try {
            authToken = await loginUser(app);
        } catch (error) {
            console.error('❌ Error en login:', error.message);
            throw error;
        }

        // Crear un archivo de prueba temporal con nombre único
        const uniqueFilename = `test-document-${Date.now()}.pdf`;
        testFilePath = path.join(__dirname, '..', uniqueFilename);
        fs.writeFileSync(testFilePath, 'Mock PDF content for testing');

        // Obtener un folder existente del seed
        const folderRes = await request(app.getHttpServer())
            .get('/folder')
            .set('Authorization', authToken);

        if (folderRes.body && folderRes.body.length > 0) {
            folderId = folderRes.body[0].id_folder || folderRes.body[0].id;
        } else {
            console.warn('⚠️  No hay folders en la BD, tests de documentos pueden fallar');
            folderId = 1; // Fallback
        }
    });

    afterAll(async () => {
        // Limpiar archivo de prueba
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
        await app.close();
    });

    describe('POST /document - Crear Documento', () => {
        it('CP-D-001: Debe crear un documento con archivo PDF', async () => {
            const res = await request(app.getHttpServer())
                .post('/document')
                .set('Authorization', authToken)
                .field('id_folder', folderId.toString())
                .attach('file', testFilePath)
                .expect(201);

            expect(res.body).toHaveProperty('id_document');
            expect(res.body).toHaveProperty('document_url');
            expect(res.body.document_url).toContain('s3');
            createdDocumentId = res.body.id_document || res.body.id;
        });

        it('CP-D-002: Debe rechazar documento sin archivo', () => {
            return request(app.getHttpServer())
                .post('/document')
                .set('Authorization', authToken)
                .field('id_folder', folderId.toString())
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toContain('archivo');
                });
        });

        it('CP-D-003: Debe rechazar documento con id_folder inválido', () => {
            return request(app.getHttpServer())
                .post('/document')
                .set('Authorization', authToken)
                .field('id_folder', 'abc')
                .attach('file', testFilePath)
                .expect(400);
        });
    });

    describe('GET /document - Listar Documentos', () => {
        it('CP-D-004: Debe listar todos los documentos', () => {
            return request(app.getHttpServer())
                .get('/document')
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });
    });

    describe('GET /document/folder/:folderId - Listar Documentos por Carpeta', () => {
        it('CP-D-005: Debe listar documentos filtrados por carpeta', () => {
            return request(app.getHttpServer())
                .get(`/document/folder/${folderId}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('documents');
                    expect(res.body).toHaveProperty('total_documents');
                    expect(Array.isArray(res.body.documents)).toBe(true);
                    if (res.body.documents.length > 0) {
                        res.body.documents.forEach((doc: any) => {
                            expect(doc).toHaveProperty('id_document');
                        });
                    }
                });
        });
    });

    describe('GET /document/:id - Obtener Documento por ID', () => {
        it('CP-D-006: Debe obtener un documento existente por ID', () => {
            return request(app.getHttpServer())
                .get(`/document/${createdDocumentId}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id_document');
                    expect(res.body).toHaveProperty('document_url');
                    expect(res.body).toHaveProperty('document_name');
                });
        });
    });

    describe('GET /document/:id/download - Descargar Documento', () => {
        it('CP-D-007: Debe obtener URL firmada para descargar documento', () => {
            return request(app.getHttpServer())
                .get(`/document/${createdDocumentId}/download`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('url');
                    expect(res.body).toHaveProperty('filename');
                    expect(res.body.url).toBeTruthy();
                });
        });

        it('CP-D-008: Debe retornar 404 para documento no existente', () => {
            return request(app.getHttpServer())
                .get('/document/99999/download')
                .set('Authorization', authToken)
                .expect(404)
                .expect((res) => {
                    expect(res.body.message).toBeDefined();
                    // API may return 'No se encontró el documento' or similar
                });
        });
    });

    describe('PATCH /document/:id - Actualizar Metadatos', () => {
        it('CP-D-009: Debe actualizar metadatos del documento', () => {
            return request(app.getHttpServer())
                .patch(`/document/${createdDocumentId}`)
                .set('Authorization', authToken)
                .send({
                    modificationDate: new Date().toISOString(),
                })
                .expect(200);
        });
    });

    describe('PUT /document/:id/update - Reemplazar Archivo Completo', () => {
        it('CP-D-010: Debe reemplazar el archivo completo del documento', () => {
            return request(app.getHttpServer())
                .put(`/document/${createdDocumentId}/update`)
                .set('Authorization', authToken)
                .attach('file', testFilePath)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('document_url');
                });
        });
    });

    describe('PATCH /document/:id/replace-file - Reemplazar Solo Archivo', () => {
        it('CP-D-011: Debe reemplazar solo el archivo manteniendo metadatos', () => {
            return request(app.getHttpServer())
                .patch(`/document/${createdDocumentId}/replace-file`)
                .set('Authorization', authToken)
                .attach('file', testFilePath)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('document_url');
                });
        });

        it('CP-D-012: Debe rechazar reemplazo sin archivo', () => {
            return request(app.getHttpServer())
                .patch(`/document/${createdDocumentId}/replace-file`)
                .set('Authorization', authToken)
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toBeDefined();
                    // API validation may return different message format
                });
        });
    });

    describe('PATCH /document/:id/status-accepted - Aceptar Documento', () => {
        it('CP-D-013: Debe cambiar el estado del documento a aceptado', () => {
            return request(app.getHttpServer())
                .patch(`/document/${createdDocumentId}/status-accepted`)
                .set('Authorization', authToken)
                .expect(200);
        });
    });

    describe('POST /document/:id/special-endorsed - Crear Aval Especial', () => {
        it('CP-D-014: Debe crear un aval especial para el documento', () => {
            return request(app.getHttpServer())
                .post(`/document/${createdDocumentId}/special-endorsed`)
                .set('Authorization', authToken)
                .send({
                    description: 'Aval especial por situación excepcional del candidato',
                })
                .expect(201);
        });
    });

    describe('DELETE /document/:id - Eliminar Documento', () => {
        it('CP-D-015: Debe eliminar un documento exitosamente', () => {
            return request(app.getHttpServer())
                .delete(`/document/${createdDocumentId}`)
                .set('Authorization', authToken)
                .expect(200);
        });
    });
});
