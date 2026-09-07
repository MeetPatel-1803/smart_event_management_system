import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1788762691316 implements MigrationInterface {
    name = 'AutoMigration1788762691316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_e82165487daa42ae5be53b081c9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e82165487daa42ae5be53b081c"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organiser"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "organiser" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_e82165487daa42ae5be53b081c" ON "events" USING btree ("organiser") `);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_e82165487daa42ae5be53b081c9" FOREIGN KEY ("organiser") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
