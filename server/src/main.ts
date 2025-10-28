import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    app.enableCors({
        origin: [frontendUrl, 'http://localhost:5173'],
        credentials: true,
    });

    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, '0.0.0.0');
    // eslint-disable-next-line no-console
    console.log(`API listening on http://0.0.0.0:${port}`);

    // Mostrar rutas
    const server = app.getHttpServer();
    const router = server._events.request._router;
    console.log('Available routes:');
    router.stack
        .filter((r) => r.route)
        .forEach((r) => {
            console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
        });
}

bootstrap();
