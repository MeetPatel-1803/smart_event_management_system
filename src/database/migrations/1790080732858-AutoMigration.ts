import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1790080732858 implements MigrationInterface {
  name = 'AutoMigration1790080732858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_history" ADD "expiresAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_history" DROP COLUMN "expiresAt"`,
    );
  }
}
