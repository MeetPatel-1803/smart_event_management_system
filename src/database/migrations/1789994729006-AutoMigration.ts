import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1789994729006 implements MigrationInterface {
  name = 'AutoMigration1789994729006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payment_history_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_history_provider_enum" AS ENUM('STRIPE', 'RAZORPAY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL, "status" "public"."payment_history_status_enum" NOT NULL, "provider" "public"."payment_history_provider_enum" NOT NULL, "provider_payment_id" character varying NOT NULL, "client_secret" character varying NOT NULL, CONSTRAINT "PK_5fcec51a769b65c0c3c0987f11c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."payment_history_provider_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_history_status_enum"`);
  }
}
