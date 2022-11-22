import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserTable1669081261520 implements MigrationInterface {
    name = 'createUserTable1669081261520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "password" character varying NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "is_admin" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_5328beffaa5d634a415b88e527" CHECK ("deleted_at" IS NULL), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
