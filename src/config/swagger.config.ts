import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Smart event management API')
  .setDescription('Smart event management API description')
  .setVersion('1.0')
  .addTag('smart-event-management')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'headers',
      name: 'Authorization',
    },
    'access-token',
  )
  .addSecurityRequirements('access-token')
  .build();
