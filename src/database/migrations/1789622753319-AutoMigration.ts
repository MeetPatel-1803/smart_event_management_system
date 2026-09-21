import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1789622753319 implements MigrationInterface {
    name = 'AutoMigration1789622753319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_events" DROP COLUMN "reservedSeats"`);
        await queryRunner.query(`ALTER TYPE "public"."user_events_status_enum" RENAME TO "user_events_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_events_status_enum" AS ENUM('EXPIRED', 'CANCELLED', 'WAITLISTED', 'REGISTERED', 'PAYMENT_PENDING')`);
        await queryRunner.query(`ALTER TABLE "user_events" ALTER COLUMN "status" TYPE "public"."user_events_status_enum" USING "status"::"text"::"public"."user_events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_events_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_events_status_enum_old" AS ENUM('REGISTERED', 'CANCELLED', 'PENDING', 'PAYMENT_PENDING')`);
        await queryRunner.query(`ALTER TABLE "user_events" ALTER COLUMN "status" TYPE "public"."user_events_status_enum_old" USING "status"::"text"::"public"."user_events_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_events_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_events_status_enum_old" RENAME TO "user_events_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user_events" ADD "reservedSeats" integer array NOT NULL`);
    }

}
