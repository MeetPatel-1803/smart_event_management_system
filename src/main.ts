import 'reflect-metadata';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { ApiErrorFilter } from './common/filters/http-exception.filter';
import { SeederRunner } from './database/seeders/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
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

  app.use(morgan('dev'));

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new ApiErrorFilter());

  const command = process.argv[2];

  if (command === 'seed') {
    try {
      const seederRunner = new SeederRunner(app);
      await seederRunner.run();
      await app.close();
      process.exit(0);
    } catch (error) {
      console.error(`❌ ${error}`);
      process.exit(1);
    }
  }

  await app.listen(process.env['PORT'] ?? 3000);
  console.log(`Server is running on port ${process.env['PORT'] ?? 3000} 🚀`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
