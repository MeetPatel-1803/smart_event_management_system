import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1789623301442 implements MigrationInterface {
    name = 'AutoMigration1789623301442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_events" RENAME COLUMN "noOfSeatsReserved" TO "noOfSeatsRequired"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_events" RENAME COLUMN "noOfSeatsRequired" TO "noOfSeatsReserved"`);
    }

}
