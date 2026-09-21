import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1789368373676 implements MigrationInterface {
  name = 'AutoMigration1789368373676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_events" ADD "reservedSeats" integer array NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ADD "noOfSeatsReserved" integer NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb951fb6dfdc6eba1b67d8f06c"`,
    );
    await queryRunner.query(`TRUNCATE TABLE "events" CASCADE`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organiser_id"`);
    await queryRunner.query(
      `ALTER TABLE "events" ADD "organiser_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb951fb6dfdc6eba1b67d8f06c" ON "events"  ("organiser_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb951fb6dfdc6eba1b67d8f06c"`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organiser_id"`);
    await queryRunner.query(
      `ALTER TABLE "events" ADD "organiser_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb951fb6dfdc6eba1b67d8f06c" ON "events" USING btree ("organiser_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" DROP COLUMN "noOfSeatsReserved"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" DROP COLUMN "reservedSeats"`,
    );
  }
}
