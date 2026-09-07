import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1788418439312 implements MigrationInterface {
  name = 'AutoMigration1788418439312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dfa3d03bef3f90f650fd138fb3" ON "events"  ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3d6dd8d419a802e34cf3dfa35" ON "events"  ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ce3c2391568bf16b4b566c8d6" ON "events"  ("start_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d0cb4b38cc98f88a240eb6663" ON "events"  ("end_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7123a511e7b875b804014f7790" ON "events"  ("capacity") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03dcebc1ab44daa177ae9479c4" ON "events"  ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f20503eb78cfdac5f8eda342c8" ON "events"  ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7d2c5a6caba3caa041a263992" ON "events"  ("organiserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c6f6efae7a9a5c8106b80dd6e7" ON "events"  ("registration_deadline") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b107ce97f3259bdace5af3185e" ON "events"  ("start_time", "end_time") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b107ce97f3259bdace5af3185e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c6f6efae7a9a5c8106b80dd6e7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7d2c5a6caba3caa041a263992"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f20503eb78cfdac5f8eda342c8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03dcebc1ab44daa177ae9479c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7123a511e7b875b804014f7790"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0d0cb4b38cc98f88a240eb6663"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ce3c2391568bf16b4b566c8d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3d6dd8d419a802e34cf3dfa35"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dfa3d03bef3f90f650fd138fb3"`,
    );
  }
}
