// src/lambda.ts
import { Handler } from 'aws-lambda';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

let server: any;

async function bootstrapServer() {
    const app = await NestFactory.create(AppModule);

    // Misma configuración que tu main.ts
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.enableCors();

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context) => {
    if (!server) {
        server = await bootstrapServer();
    }
    return server(event, context);
};
