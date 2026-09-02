import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1788331367078 implements MigrationInterface {
  name = 'AutoMigration1788331367078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password"
      TYPE character varying(60)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password"
      TYPE character varying
    `);
  }
}
