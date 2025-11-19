import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginUser } from '../test-helper';

describe('PositionController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let createdPositionId: number;

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
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /position - Crear Cargo', () => {
        it('CP-PO-001: Debe crear un cargo exitosamente con datos válidos', async () => {
            const uniqueName = `Gerente de Desarrollo Test ${Date.now()}`;
            const res = await request(app.getHttpServer())
                .post('/position')
                .set('Authorization', authToken)
                .send({
                    name: uniqueName,
                })
                .expect(201);

            expect(res.body).toHaveProperty('id_position');
            expect(res.body.name).toBe(uniqueName);
            createdPositionId = res.body.id_position || res.body.id;
        });

        it('CP-PO-002: Debe rechazar cargo con nombre corto (menos de 3 caracteres)', () => {
            return request(app.getHttpServer())
                .post('/position')
                .set('Authorization', authToken)
                .send({
                    name: 'Ab',
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('CP-PO-003: Debe rechazar cargo con nombre largo (más de 50 caracteres)', () => {
            return request(app.getHttpServer())
                .post('/position')
                .set('Authorization', authToken)
                .send({
                    name: 'Este es un nombre extremadamente largo que supera los cincuenta caracteres permitidos para un cargo',
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('CP-PO-004: Debe rechazar cargo con campo vacío', () => {
            return request(app.getHttpServer())
                .post('/position')
                .set('Authorization', authToken)
                .send({
                    name: '',
                })
                .expect(400);
        });
    });

    describe('GET /position - Listar Cargos', () => {
        it('CP-PO-005: Debe listar todos los cargos', () => {
            return request(app.getHttpServer())
                .get('/position')
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });
    });

    describe('GET /position/:id - Obtener Cargo por ID', () => {
        it('CP-PO-006: Debe obtener un cargo existente por ID', () => {
            return request(app.getHttpServer())
                .get(`/position/${createdPositionId}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id_position');
                    expect(res.body).toHaveProperty('name');
                    expect(res.body.id_position).toBe(createdPositionId);
                });
        });

        it('CP-PO-007: Debe retornar 404 para cargo no existente', () => {
            return request(app.getHttpServer())
                .get('/position/99999')
                .set('Authorization', authToken)
                .expect(404);
        });
    });

    describe('PATCH /position/:id - Actualizar Cargo', () => {
        it('CP-PO-008: Debe actualizar un cargo existente', () => {
            return request(app.getHttpServer())
                .patch(`/position/${createdPositionId}`)
                .set('Authorization', authToken)
                .send({
                    name: 'Director de Tecnología',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toBe('Director de Tecnología');
                });
        });

        it('CP-PO-009: Debe rechazar actualización sin autenticación', () => {
            return request(app.getHttpServer())
                .patch(`/position/${createdPositionId}`)
                .send({
                    name: 'Director de Tecnología',
                })
                .expect(401);
        });
    });

    describe('DELETE /position/:id - Eliminar Cargo', () => {
        it('CP-PO-010: Debe eliminar un cargo o retornar conflicto si tiene candidatos', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/position/${createdPositionId}`)
                .set('Authorization', authToken);

            // Puede ser 200 (eliminado) o 409 (conflicto por candidatos asociados)
            expect([200, 409]).toContain(response.status);
        });
    });
});
