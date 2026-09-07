import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1788355073001 implements MigrationInterface {
  name = 'AutoMigration1788355073001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."events_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'DELETED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_category_enum" AS ENUM('CONCERT', 'CONFERENCE', 'BUSINESS', 'WORKSHOP', 'SPORTS', 'FOOD_AND_DRINK', 'ARTS_AND_CULTURE', 'COMEDY', 'FESTIVAL', 'EXHIBITION', 'CAREER', 'EDUCATION', 'HEALTH_AND_WELLNESS', 'TRAVEL_AND_ADVENTURE', 'KIDS_AND_FAMILY', 'COMMUNITY', 'CHARITY', 'WEDDING', 'PARTY', 'RELIGIOUS_AND_SPIRITUAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(50) NOT NULL, "description" character varying(200), "price" double precision NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "location" character varying(200) NOT NULL, "capacity" integer NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'DRAFT', "banner_image" character varying, "category" "public"."events_category_enum" NOT NULL DEFAULT 'CONCERT', "registration_deadline" TIMESTAMP NOT NULL, "organiserId" uuid, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_events_status_enum" AS ENUM('REGISTERED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."user_events_status_enum", "user_id" uuid, "event_id" uuid, CONSTRAINT "PK_22f49067e87f2c8a3fff76543d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee5fe78baa6daa8bd2fa2392f5" ON "user_events"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d90e82a7c01f4b3a4cbf43a17" ON "user_events"  ("event_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8f0129f0fada349745e8a14cb5" ON "user_events"  ("user_id", "event_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_c7d2c5a6caba3caa041a263992c" FOREIGN KEY ("organiserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "events" DROP CONSTRAINT "FK_c7d2c5a6caba3caa041a263992c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f0129f0fada349745e8a14cb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d90e82a7c01f4b3a4cbf43a17"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee5fe78baa6daa8bd2fa2392f5"`,
    );
    await queryRunner.query(`DROP TABLE "user_events"`);
    await queryRunner.query(`DROP TYPE "public"."user_events_status_enum"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "public"."events_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
  }
}
