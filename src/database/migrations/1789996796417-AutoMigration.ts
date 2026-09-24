import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1789996796417 implements MigrationInterface {
  name = 'AutoMigration1789996796417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_history" ALTER COLUMN "provider_payment_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_history" ALTER COLUMN "client_secret" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_history" ALTER COLUMN "client_secret" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_history" ALTER COLUMN "provider_payment_id" SET NOT NULL`,
    );
  }
}
