import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1789034347628 implements MigrationInterface {
  name = 'AutoMigration1789034347628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee5fe78baa6daa8bd2fa2392f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d90e82a7c01f4b3a4cbf43a17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" DROP CONSTRAINT "FK_ee5fe78baa6daa8bd2fa2392f53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" DROP CONSTRAINT "FK_5d90e82a7c01f4b3a4cbf43a170"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f0129f0fada349745e8a14cb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ALTER COLUMN "event_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8f0129f0fada349745e8a14cb5" ON "user_events"  ("user_id", "event_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ADD CONSTRAINT "FK_ee5fe78baa6daa8bd2fa2392f53" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ADD CONSTRAINT "FK_5d90e82a7c01f4b3a4cbf43a170" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_events" DROP CONSTRAINT "FK_5d90e82a7c01f4b3a4cbf43a170"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" DROP CONSTRAINT "FK_ee5fe78baa6daa8bd2fa2392f53"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f0129f0fada349745e8a14cb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ALTER COLUMN "event_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8f0129f0fada349745e8a14cb5" ON "user_events" USING btree ("user_id", "event_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ADD CONSTRAINT "FK_5d90e82a7c01f4b3a4cbf43a170" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_events" ADD CONSTRAINT "FK_ee5fe78baa6daa8bd2fa2392f53" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d90e82a7c01f4b3a4cbf43a17" ON "user_events" USING btree ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee5fe78baa6daa8bd2fa2392f5" ON "user_events" USING btree ("user_id") `,
    );
  }
}
