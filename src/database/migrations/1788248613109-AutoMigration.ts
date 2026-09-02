import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1788248613109 implements MigrationInterface {
  name = 'AutoMigration1788248613109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_token_expire" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_token_expire"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_token"`);
  }
}
