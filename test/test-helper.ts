import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

/**
 * Crea y configura una aplicación NestJS para testing
 */
export async function createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Configurar validación global como en producción
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.init();
    return app;
}

/**
 * Limpia la base de datos entre tests
 */
export async function cleanDatabase(app: INestApplication): Promise<void> {
    const dataSource = app.get(DataSource);
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
}

/**
 * Cierra la aplicación y limpia recursos
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
    if (app) {
        await app.close();
    }
}

/**
 * Realiza login de usuario y retorna el token JWT
 */
export async function loginUser(
    app: INestApplication,
    email: string = 'admin@cq.com',
    password: string = 'admin123',
): Promise<string> {
    const response = await request(app.getHttpServer())
        .post('/auth/user/login')
        .send({ email, password });

    if (response.status !== 201) {
        throw new Error(`Login failed: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return `Bearer ${response.body.access_token}`;
}

/**
 * Realiza login de candidato y retorna el token JWT
 */
export async function loginCandidate(
    app: INestApplication,
    email: string = 'candidate@cq.com',
    password: string = 'candidate123',
): Promise<string> {
    const response = await request(app.getHttpServer())
        .post('/auth/candidate/login')
        .send({ email, password });

    if (response.status !== 201) {
        throw new Error(`Candidate login failed: ${response.status} ${JSON.stringify(response.body)}`);
    }

    return `Bearer ${response.body.access_token}`;
}

/**
 * Genera un token JWT de prueba (solo para tests que no necesitan autenticación real)
 */
export function generateTestToken(payload: any = {}): string {
    // Mock token - en producción se genera con JWT service
    return 'Bearer test-token-' + Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Datos de prueba para candidatos
 */
export const testCandidateData = {
    valid: {
        name: 'Juan Pérez García',
        identifier: '1234567890',
        identifier_type: 'CC',
        email: 'juan.perez.test@email.com',
        phone: '3001234567',
        profile: 1,
        position: 1,
    },
    invalid: {
        shortName: 'Juan',
        invalidEmail: 'email_invalido',
        shortPhone: '300',
    },
};

/**
 * Datos de prueba para perfiles
 */
export const testProfileData = {
    valid: {
        name: 'Desarrollador Backend Test',
    },
    invalid: {
        shortName: 'Ab',
        longName: 'Este es un nombre extremadamente largo que supera los cincuenta caracteres permitidos',
        empty: '',
    },
};

/**
 * Datos de prueba para cargos
 */
export const testPositionData = {
    valid: {
        name: 'Gerente de Desarrollo Test',
    },
    invalid: {
        shortName: 'Ab',
        longName: 'Este es un nombre extremadamente largo que supera los cincuenta caracteres permitidos',
        empty: '',
    },
};
