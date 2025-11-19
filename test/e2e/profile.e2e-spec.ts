import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginUser } from '../test-helper';

describe('ProfileController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let createdProfileId: number;

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

    describe('POST /profile - Crear Perfil', () => {
        it('CP-P-001: Debe crear un perfil exitosamente con datos válidos', async () => {
            const uniqueName = `Desarrollador Backend Test ${Date.now()}`;
            const res = await request(app.getHttpServer())
                .post('/profile')
                .set('Authorization', authToken)
                .send({
                    name: uniqueName,
                })
                .expect(201);

            expect(res.body).toHaveProperty('id_profile');
            expect(res.body.name).toBe(uniqueName);
            createdProfileId = res.body.id_profile || res.body.id;
        });

        it('CP-P-002: Debe rechazar perfil con nombre corto (menos de 3 caracteres)', () => {
            return request(app.getHttpServer())
                .post('/profile')
                .set('Authorization', authToken)
                .send({
                    name: 'Ab',
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('CP-P-003: Debe rechazar perfil con nombre largo (más de 50 caracteres)', () => {
            return request(app.getHttpServer())
                .post('/profile')
                .set('Authorization', authToken)
                .send({
                    name: 'Este es un nombre extremadamente largo que supera los cincuenta caracteres permitidos',
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('CP-P-004: Debe rechazar perfil con campo vacío', () => {
            return request(app.getHttpServer())
                .post('/profile')
                .set('Authorization', authToken)
                .send({
                    name: '',
                })
                .expect(400);
        });
    });

    describe('GET /profile - Listar Perfiles', () => {
        it('CP-P-005: Debe listar todos los perfiles', () => {
            return request(app.getHttpServer())
                .get('/profile')
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });
    });

    describe('GET /profile/:id - Obtener Perfil por ID', () => {
        it('CP-P-006: Debe obtener un perfil existente por ID', () => {
            return request(app.getHttpServer())
                .get(`/profile/${createdProfileId}`)
                .set('Authorization', authToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id_profile');
                    expect(res.body).toHaveProperty('name');
                    expect(res.body.id_profile).toBe(createdProfileId);
                });
        });

        it('CP-P-007: Debe retornar 404 para perfil no existente', () => {
            return request(app.getHttpServer())
                .get('/profile/99999')
                .set('Authorization', authToken)
                .expect(404);
        });
    });

    describe('PATCH /profile/:id - Actualizar Perfil', () => {
        it('CP-P-008: Debe actualizar un perfil existente', () => {
            return request(app.getHttpServer())
                .patch(`/profile/${createdProfileId}`)
                .set('Authorization', authToken)
                .send({
                    name: 'Desarrollador Full Stack',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toBe('Desarrollador Full Stack');
                });
        });

        it('CP-P-009: Debe rechazar actualización sin autenticación', () => {
            return request(app.getHttpServer())
                .patch(`/profile/${createdProfileId}`)
                .send({
                    name: 'Desarrollador Full Stack',
                })
                .expect(401);
        });
    });

    describe('DELETE /profile/:id - Eliminar Perfil', () => {
        it('CP-P-010: Debe eliminar un perfil o retornar conflicto si tiene candidatos', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/profile/${createdProfileId}`)
                .set('Authorization', authToken);

            // Puede ser 200 (eliminado) o 409 (conflicto por candidatos asociados)
            expect([200, 409]).toContain(response.status);
        });
    });
});
