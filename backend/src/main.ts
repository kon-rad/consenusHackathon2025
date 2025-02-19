import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const defaultOptions = new DocumentBuilder().setTitle('OVPN API').build();
  const defaultDocument = SwaggerModule.createDocument(app, defaultOptions, {
    include: [],
  });
  SwaggerModule.setup('api/doc', app, defaultDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
