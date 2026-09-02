import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env['DB_HOST'],
    port: process.env['DB_PORT'] as unknown as number,
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_NAME'],

    autoLoadEntities: true,
    synchronize: false,
  };
};
