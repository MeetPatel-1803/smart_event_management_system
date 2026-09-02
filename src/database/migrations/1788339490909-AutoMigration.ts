import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1788339490909 implements MigrationInterface {
  name = 'AutoMigration1788339490909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "refresh_token" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token"`);
  }
}
