import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginUser, loginCandidate } from '../test-helper';

describe('CandidateController (e2e)', () => {
    let app: INestApplication;
    let userAuthToken: string;
    let candidateAuthToken: string;
    let createdCandidateId: number;
    let createdCandidateEmail: string;
    let createdCandidatePassword: string;
    let profileId: number;
    let positionId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Login real para obtener tokens válidos
        try {
            userAuthToken = await loginUser(app);

            // Intentar login de candidato (puede fallar si no existe)
            try {
                candidateAuthToken = await loginCandidate(app);
            } catch (error) {
                console.warn('No se pudo hacer login de candidato, algunos tests pueden fallar');
                candidateAuthToken = userAuthToken; // Fallback
            }
        } catch (error) {
            console.error('Error en login:', error.message);
            throw error;
        }

        // Crear perfil y cargo para usar en tests
        try {
            const profileRes = await request(app.getHttpServer())
                .post('/profile')
                .set('Authorization', userAuthToken)
                .send({ name: `Perfil Test E2E ${Date.now()}` })
                .expect(201);
            profileId = profileRes.body.id_profile || profileRes.body.id;

            const positionRes = await request(app.getHttpServer())
                .post('/position')
                .set('Authorization', userAuthToken)
                .send({ name: `Cargo Test E2E ${Date.now()}` })
                .expect(201);
            positionId = positionRes.body.id_position || positionRes.body.id;

            if (!profileId || !positionId) {
                throw new Error(`Failed to create test dependencies: profileId=${profileId}, positionId=${positionId}`);
            }
        } catch (error) {
            console.error('Error creando perfil/cargo para tests:', error);
            throw error;
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /candidate - Crear Candidato', () => {
        it('CP-C-001: Debe crear un candidato exitosamente con datos válidos', async () => {
            const uniqueEmail = `juan.perez.${Date.now()}@test.com`;
            const uniqueId = `T${Date.now().toString().slice(-8)}`; // Max 9 chars (T + 8 digits)
            const res = await request(app.getHttpServer())
                .post('/candidate')
                .set('Authorization', userAuthToken)
                .send({
                    name: 'Juan Pérez García',
                    identifier: uniqueId,
                    identifier_type: 'CC',
                    email: uniqueEmail,
                    phone: '3001234567',
                    profile: profileId,
                    position: positionId,
                })
                .expect(201);

            expect(res.body).toHaveProperty('id_candidate');
            expect(res.body).toHaveProperty('plainPassword');
            expect(res.body.name).toBe('Juan Pérez García');
            expect(res.body.email).toBe(uniqueEmail);

            // Save credentials for later tests
            createdCandidateId = res.body.id_candidate || res.body.id;
            createdCandidateEmail = uniqueEmail;
            createdCandidatePassword = res.body.plainPassword;
        });

        it('CP-C-002: Debe rechazar candidato con nombre corto (menos de 5 caracteres)', () => {
            return request(app.getHttpServer())
                .post('/candidate')
                .set('Authorization', userAuthToken)
                .send({
                    name: 'Juan',
                    identifier: '1234567890',
                    identifier_type: 'CC',
                    email: 'juan@email.com',
                    phone: '3001234567',
                    profile: profileId,
                    position: positionId,
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                });
        });

        it('CP-C-003: Debe rechazar candidato con email inválido', () => {
            return request(app.getHttpServer())
                .post('/candidate')
                .set('Authorization', userAuthToken)
                .send({
                    name: 'Juan Pérez García',
                    identifier: '1234567890',
                    identifier_type: 'CC',
                    email: 'email_invalido',
                    phone: '3001234567',
                    profile: profileId,
                    position: positionId,
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toBeDefined();
                    // API validates with class-validator and returns validation errors
                });
        });

        it('CP-C-004: Debe rechazar candidato con teléfono inválido', () => {
            return request(app.getHttpServer())
                .post('/candidate')
                .set('Authorization', userAuthToken)
                .send({
                    name: 'Juan Pérez García',
                    identifier: '1234567890',
                    identifier_type: 'CC',
                    email: 'juan@email.com',
                    phone: '300',
                    profile: profileId,
                    position: positionId,
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toBeDefined();
                    // API validates with class-validator (MinLength(10))
                });
        });
    });

    describe('GET /candidate - Listar Candidatos', () => {
        it('CP-C-005: Debe rechazar listado sin autenticación', () => {
            return request(app.getHttpServer())
                .get('/candidate')
                .expect(401);
        });

        it('CP-C-006: Debe listar todos los candidatos con autenticación', () => {
            return request(app.getHttpServer())
                .get('/candidate')
                .set('Authorization', userAuthToken)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });
    });

    describe('GET /candidate/:id - Obtener Candidato por ID', () => {
        it('CP-C-007: Debe obtener un candidato existente por ID', () => {
            return request(app.getHttpServer())
                .get(`/candidate/${createdCandidateId}`)
                .set('Authorization', userAuthToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id_candidate');
                    expect(res.body).toHaveProperty('name');
                    expect(res.body).toHaveProperty('email');
                    expect(res.body.id_candidate).toBe(createdCandidateId);
                });
        });

        it('CP-C-008: Debe retornar 404 para candidato no existente', () => {
            return request(app.getHttpServer())
                .get('/candidate/99999')
                .set('Authorization', userAuthToken)
                .expect(404);
        });
    });

    describe('PATCH /candidate/:id - Actualizar Candidato', () => {
        it('CP-C-009: Debe actualizar parcialmente un candidato', async () => {
            const newEmail = `juan.perez.updated.${Date.now()}@email.com`;
            const res = await request(app.getHttpServer())
                .patch(`/candidate/${createdCandidateId}`)
                .set('Authorization', userAuthToken)
                .send({
                    email: newEmail,
                    phone: '3009876543',
                })
                .expect(200);

            expect(res.body.email).toBe(newEmail);
            expect(res.body.phone).toBe('3009876543');

            // Update email for subsequent tests
            createdCandidateEmail = newEmail;
        });
    });

    describe('PATCH /candidate/:id/status-to-hired - Cambiar Estado a Contratado', () => {
        it('CP-C-010: Debe cambiar el estado del candidato a contratado', async () => {
            // Este endpoint requiere que el candidato tenga un folder y documentos aceptados
            // Para simplificar el test, creamos un folder para el candidato
            await request(app.getHttpServer())
                .post('/folder')
                .set('Authorization', userAuthToken)
                .send({ id_candidate: createdCandidateId });

            return request(app.getHttpServer())
                .patch(`/candidate/${createdCandidateId}/status-to-hired`)
                .set('Authorization', userAuthToken)
                .expect(200);
        });
    });

    describe('PATCH /candidate/:id/status-review - Cambiar Estado a Revisión', () => {
        it('CP-C-011: Debe cambiar el estado a revisión con token de candidato', async () => {
            // Login with the newly created candidate credentials
            const loginRes = await request(app.getHttpServer())
                .post('/auth/candidate/login')
                .send({
                    email: createdCandidateEmail,
                    password: createdCandidatePassword,
                });

            // Debug: log the login response if it fails
            if (loginRes.status !== 201) {
                console.log('Login failed:', {
                    status: loginRes.status,
                    body: loginRes.body,
                    email: createdCandidateEmail,
                    passwordLength: createdCandidatePassword?.length
                });
            }

            expect(loginRes.status).toBe(201);
            expect(loginRes.body).toHaveProperty('access_token');

            const newCandidateToken = `Bearer ${loginRes.body.access_token}`;

            return request(app.getHttpServer())
                .patch(`/candidate/${createdCandidateId}/status-review`)
                .set('Authorization', newCandidateToken)
                .expect(200);
        });
    });

    describe('DELETE /candidate/:id - Eliminar Candidato', () => {
        it('CP-C-012: Debe eliminar un candidato exitosamente', async () => {
            // Primero eliminar las carpetas asociadas al candidato (si existen)
            const foldersRes = await request(app.getHttpServer())
                .get('/folder')
                .set('Authorization', userAuthToken);

            if (foldersRes.body && Array.isArray(foldersRes.body)) {
                const candidateFolders = foldersRes.body.filter((f: any) => f.id_candidate === createdCandidateId);
                for (const folder of candidateFolders) {
                    await request(app.getHttpServer())
                        .delete(`/folder/${folder.id_folder}`)
                        .set('Authorization', userAuthToken);
                }
            }

            // Ahora eliminar el candidato
            return request(app.getHttpServer())
                .delete(`/candidate/${createdCandidateId}`)
                .set('Authorization', userAuthToken)
                .expect(200);
        });
    });
});
