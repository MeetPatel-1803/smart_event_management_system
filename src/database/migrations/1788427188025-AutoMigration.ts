import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1788427188025 implements MigrationInterface {
  name = 'AutoMigration1788427188025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_c7d2c5a6caba3caa041a263992c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7d2c5a6caba3caa041a263992"`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organiserId"`);
    await queryRunner.query(
      `ALTER TABLE "events" ADD "organiser_id" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "events" ADD "organiser" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_e82165487daa42ae5be53b081c" ON "events"  ("organiser") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb951fb6dfdc6eba1b67d8f06c" ON "events"  ("organiser_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_e82165487daa42ae5be53b081c9" FOREIGN KEY ("organiser") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_e82165487daa42ae5be53b081c9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb951fb6dfdc6eba1b67d8f06c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e82165487daa42ae5be53b081c"`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organiser"`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organiser_id"`);
    await queryRunner.query(`ALTER TABLE "events" ADD "organiserId" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c7d2c5a6caba3caa041a263992" ON "events" USING btree ("organiserId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_c7d2c5a6caba3caa041a263992c" FOREIGN KEY ("organiserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
