import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as session from 'express-session';
import * as compression from 'compression';
import { RedisStore } from 'connect-redis';
import { redisClient } from './lib/redis';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'session:',
  });

  app.use(
    session({
      store: redisStore,
      name: 'session-id',
      secret: process.env.SESSION_SECRET ?? 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        secure: false,
        sameSite: 'lax',
      },
      rolling: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Quiz app')
    .setDescription('Quiz app')
    .setVersion('1.0')
    .addTag('quiz')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
