import 'reflect-metadata';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { ApiErrorFilter } from './common/filters/http-exception.filter';
import { SeederRunner } from './database/seeders/seed';
import { RedisIoAdapter } from './shared/socket/redis-io.adapter';
// import { SwaggerModule } from '@nestjs/swagger';
// import { swaggerConfig } from './config/swagger.config';
// import path from 'path';
// import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: ['error', 'warn', 'log'],
    rawBody: true,
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

  app.setGlobalPrefix('api/v1', {
    exclude: ['admin/queues'],
  });

  app.useGlobalFilters(new ApiErrorFilter());

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const command = process.argv[2];

  if (command === 'seed') {
    try {
      const seederRunner = new SeederRunner(app);
      await seederRunner.run();
      await app.close();
      process.exit(0);
    } catch (error: any) {
      console.error(`❌ ${error}`);
      process.exit(1);
    }
  }

  // -------------- Swagger/Open API --------------

  // const documentFactory = () =>
  //   SwaggerModule.createDocument(app, swaggerConfig);

  // SwaggerModule.setup('api/docs', app, documentFactory, {
  //   swaggerOptions: {
  //     persistAuthorization: true, // Keeps token refreshed on reload
  //   },
  // });

  // const isDevMode =
  //   process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  // const hasExportFlag = process.argv.includes('--export-swagger');

  // // 📁 Production-Grade Conditional File Export Check
  // // Run your app with: EXPORT_SWAGGER=true npm run start
  // if (isDevMode || hasExportFlag) {
  //   const document = documentFactory();

  //   const outputPath = path.join(process.cwd(), 'openapi-spec.json');
  //   fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');
  //   console.log(`✅ OpenAPI contract compiled successfully to: ${outputPath}`);

  //   // If your ONLY goal was exporting the file (e.g., in a CI/CD pipeline step),
  //   // you can close the process immediately instead of keeping the port open.
  //   if (process.env.CI === 'true') {
  //     await app.close();
  //     process.exit(0);
  //   }
  // }

  // ----------------------------------------------

  await app.listen(process.env['PORT'] ?? 3000);
  console.log(`Server is running on port ${process.env['PORT'] ?? 3000} 🚀`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
