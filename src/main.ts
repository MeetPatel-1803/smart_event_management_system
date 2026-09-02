import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { ApiErrorFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: '*', // adjust this if frontend is running on a different port
    credentials: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(morgan('dev'));

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new ApiErrorFilter());

  await app.listen(process.env['PORT'] ?? 3000);
  console.log(`Server is running on port ${process.env['PORT'] ?? 3000} 🚀`);
}

bootstrap();
